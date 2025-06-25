import React, { useState, useRef, useEffect, useCallback } from "react";
import interact from 'interactjs';
import axios from 'axios';
import config from "../config";
import DataTableComponent from "./DataTableComponent"; 
import Visualisasi from "./Visualiaze"; 
import '../assets/css/canvas.css';

const Canvas = ({
  data,
  query,
  visualizationType,
  visualizationConfig,
  onVisualizationSelect,
  selectedVisualization,
  currentCanvasIndex,
  setCurrentCanvasIndex,
  canvases,
  setCanvases,
  currentCanvasId,
  setCurrentCanvasId,
  newVisualizationPayload,
  userAccessLevel
}) => {
  const [scale, setScale] = useState(0.75);
  const [visualizations, setVisualizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state untuk data awal
  const [pendingSaveTimeouts, setPendingSaveTimeouts] = useState({});
  const [totalCanvases, setTotalCanvases] = useState(0);
  // const [isSaving, setIsSaving] = useState(false);

  const zoomSpeed = 0.005;
  const containerRef = useRef(null);

  // Fungsi utilitas untuk menghasilkan ID unik
  const generateUniqueId = () => {
    return 'visualization-' + Math.random().toString(36).substr(2, 9);
  };

  // Memetakan data dari API ke struktur state internal
  const mapApiVisualizationToState = useCallback((apiVisualization) => {
    let configData = apiVisualization.config;

    // Coba parse config jika string, tangani error jika gagal
    if (typeof configData === 'string') {
      try {
        // Jika backend mengirim array berisi string JSON (karena workaround sebelumnya), ambil elemen pertama
        if (configData.startsWith('[') && configData.endsWith(']')) {
             const parsedArray = JSON.parse(configData);
             if (Array.isArray(parsedArray) && parsedArray.length > 0 && typeof parsedArray[0] === 'string') {
                 configData = JSON.parse(parsedArray[0]); // Parse string JSON di dalam array
             } else if (Array.isArray(parsedArray)) {
                 // Jika backend mengirim array kosong atau format lain, fallback ke objek kosong
                 console.warn("Received config as array, but format unexpected. Falling back.", parsedArray);
                 configData = {};
             } else {
                 // Jika parse string tidak menghasilkan array, coba parse sebagai objek biasa
                 configData = JSON.parse(configData);
             }
        } else {
            // Jika bukan format array dalam string, parse sebagai objek biasa
            configData = JSON.parse(configData);
        }
      } catch (e) {
        console.error("Failed to parse visualization config:", e, apiVisualization.config);
        configData = {}; // Fallback ke objek kosong jika parsing gagal
      }
    } else if (Array.isArray(configData)) {
        // Jika backend mengirim array langsung (karena workaround di save API), coba ambil dan parse elemen pertama
        if (configData.length > 0 && typeof configData[0] === 'string') {
            try {
                configData = JSON.parse(configData[0]);
            } catch(e) {
                console.error("Failed to parse JSON string inside config array:", e, configData[0]);
                configData = {};
            }
        } else {
            console.warn("Received config as array, but format unexpected or empty. Falling back.", configData);
            configData = {};
        }
    } else if (typeof configData !== 'object' || configData === null) {
        // Jika tipe bukan string, array, atau objek, fallback
        console.warn("Unexpected config type received from API. Falling back.", configData);
        configData = {};
    }

    const vizType = apiVisualization.visualization_type;
    const vizName = apiVisualization.name || "Visualisasi Data";
    const vizQuery = apiVisualization.query;
    const vizDatasource = apiVisualization.id_datasource;

    let builderPayload = apiVisualization.builder_payload;
    if (typeof builderPayload === 'string') {
        try {
            builderPayload = JSON.parse(builderPayload);
        } catch (e) {
            console.error("Failed to parse builder_payload:", e);
            builderPayload = null;
        }
    }

    return {
      id: apiVisualization.id_visualization.toString(),
      id_datasource: vizDatasource,
      id_canvas: apiVisualization.id_canvas,
      query: vizQuery,
      type: vizType,
      title: vizName,
      config: configData || {}, // Pastikan config selalu objek di state
      x: apiVisualization.position_x || 0,
      y: apiVisualization.position_y || 0,
      width: apiVisualization.width || 800,
      height: apiVisualization.height || 400,
      builderPayload: builderPayload,
      requestPayload: { // Menyimpan payload request yang stabil untuk di pass ke Visualisasi
        id_datasource: vizDatasource,
        query: vizQuery,
        visualizationType: vizType,
        name: vizName
      }
    };
  }, []); // mapApiVisualizationToState tidak punya dependensi luar

useEffect(() => {
  const savedIndex = localStorage.getItem("currentCanvasIndex");
  const savedCanvasId = localStorage.getItem("currentCanvasId");

  if (savedIndex !== null && savedCanvasId !== null) {
    setCurrentCanvasIndex(parseInt(savedIndex));
    setCurrentCanvasId(parseInt(savedCanvasId));
  } else {
    setIsLoading(true)
    // Panggil API dengan Axios
    axios.get(`${config.API_BASE_URL}/api/kelola-dashboard/first-canvas`)
      .then((response) => {
        const data = response.data;
        if (data.success && data.data) {
          const canvasId = data.data.id_canvas;
          setCurrentCanvasIndex(0); // Karena ini canvas pertama
          setCurrentCanvasId(canvasId);
          localStorage.setItem("currentCanvasIndex", "0");
          localStorage.setItem("currentCanvasId", canvasId);
        } else {
          console.error("Gagal mendapatkan canvas pertama:", data.message);
        }
      })
      .catch((error) => {
        console.error("Terjadi kesalahan saat memanggil API canvas:", error);
      });
  }
}, [setCurrentCanvasIndex, setCurrentCanvasId]);


useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn("Loading visualizations timed out.");
        setIsLoading(false);
        setVisualizations([]); // Reset jika timeout
      }
    }, 10000); // Timeout 10 detik

    setIsLoading(true);
    const currentCanvasId = canvases[currentCanvasIndex]?.id;
    
    // Mengambil visualisasi berdasarkan ID canvas yang statis (ID 1)
    axios.get(`${config.API_BASE_URL}/api/kelola-dashboard/canvas/${currentCanvasId}/visualizations`)
      .then(response => {
        console.log("API Response (get-visualizations for canva):", response.data);
        if (response.data.status === 'success' && Array.isArray(response.data.data)) {
          const apiVisualizations = response.data.data;
          const loadedVisualizations = apiVisualizations
            .filter(viz => !viz.is_deleted) // Filter visualisasi yang belum dihapus
            .map(mapApiVisualizationToState); // Map ke format state
          setVisualizations(loadedVisualizations);
        } else {
          console.warn("API get-visualizations non-success or invalid data format:", response.data.message || response.data);
          setVisualizations([]); // Kosongkan jika gagal atau format salah
        }
      })
      .catch(error => {
        console.error("Error loading saved visualizations:", error.response ? error.response.data : error.message);
        setVisualizations([]); // Kosongkan jika ada error network/server
      })
      .finally(() => {
        clearTimeout(timeoutId); // Hapus timeout jika request selesai
        setIsLoading(false); // Set loading selesai
      });

    // Cleanup timeout saat komponen unmount
    return () => clearTimeout(timeoutId);
  }, [currentCanvasIndex,canvases, mapApiVisualizationToState]); // Dependency hanya pada mapApiVisualizationToState

  // Fungsi untuk menyimpan visualisasi ke API (dengan workaround untuk config)
  const saveVisualizationToAPI = useCallback((visualization) => {
  // Validasi dasar sebelum mengirim
  // setIsSaving(true);
  // if (!visualization.query || !visualization.type || !visualization.id_datasource) {
  //     setIsSaving(false);
  //     console.warn("Attempted to save visualization with missing required fields (query, type, id_datasource).", visualization);
  //     return Promise.reject("Missing required fields");
  // }
  

  // Pastikan config adalah objek sebelum stringify
  const configObject = typeof visualization.config === 'object' && visualization.config !== null
                         ? visualization.config
                         : {}; // Fallback ke objek kosong jika null atau bukan objek

  // Stringify objek config
  const configString = JSON.stringify(configObject);

  const currentCanvasId = canvases[currentCanvasIndex]?.id;
  
  if (!currentCanvasId) {
    console.error("Canvas ID is not available.");
    return Promise.reject("Canvas ID is not available.");
  }

  // Siapkan payload untuk API
  const payload = {
  // id_canvas: canvases[currentCanvasIndex]?.id,
  id_canvas: currentCanvasId,
  id_datasource: visualization.id_datasource, // Wajib ada
  id_visualization: visualization.id, // Kirim ID jika ada, untuk update
  name: visualization.title || `Visualisasi ${visualization.type}`, // Default name jika tidak ada
  visualization_type: visualization.type, // Wajib ada
  query: visualization.query, // Wajib ada
  // --- WORKAROUND untuk validasi backend yang mengharuskan config array ---
  // Kirim string JSON dari config sebagai elemen tunggal dalam sebuah array.
  config: [configString],
  // --- AKHIR WORKAROUND ---
  width: Math.round(visualization.width) || 600, // Default width jika tidak ada
  height: Math.round(visualization.height) || 400, // Default height jika tidak ada
  position_x: Math.round(visualization.x) || 0, // Default x jika tidak ada
  position_y: Math.round(visualization.y) || 0, // Default y jika tidak ada
  builder_payload: visualization.builderPayload || null, 
};


  console.log("Saving visualization to API (Payload):", payload);

  // Kirim request POST ke API
  return axios.post(`${config.API_BASE_URL}/api/kelola-dashboard/save-visualization`, payload)
    .then(response => {
      console.log("Visualization saved response:", response.data);
      // Cek status sukses dari response API
      // if (response.data.status !== 'success') {
      //   setIsSaving(false);
      // }
      
      // Periksa apakah data dan id_visualization ada dalam response
      if (response.data.data && response.data.data.id_visualization) {
        const dbId = response.data.data.id_visualization;
        console.log(`Loh ${visualization.id || 'undefined'} to database ID ${dbId}`)
        // Selalu gunakan ID dari database (baik untuk visualisasi baru atau yang diupdate)
        if (dbId !== visualization.id) {
          console.log(`Updating visualization ID from ${visualization.id || 'undefined'} to database ID ${dbId}`);
          
          // Update visualizations state untuk menggunakan ID dari database
          setVisualizations(prev => prev.map(v => {
            if (v.id === visualization.id) {
              return {
                ...v, 
                id: dbId,  // Ganti dengan ID dari database
                // Update requestPayload juga jika ada
                ...(v.requestPayload ? {
                  requestPayload: {
                    ...v.requestPayload,
                    id_visualization: dbId
                  }
                } : {})
              };
            }
            return v;
          }));
          
          // Jika visualisasi ini sedang dipilih, update selected visualization juga
          if (selectedVisualization && selectedVisualization.id === visualization.id) {
            onVisualizationSelect({
              ...selectedVisualization,
              id: dbId
            });
          }
          
          // Update ID visualisasi (untuk dikembalikan ke pemanggil fungsi)
          visualization.id = dbId;
        }
        
        // Update properti lain jika tersedia di response
        if (response.data.data.name) {
          visualization.title = response.data.data.name;
        }
        
        if (response.data.data.width) {
          visualization.width = response.data.data.width;
        }
        
        if (response.data.data.height) {
          visualization.height = response.data.data.height;
        }
        
        if (response.data.data.position_x !== undefined) {
          visualization.x = response.data.data.position_x;
        }
        
        if (response.data.data.position_y !== undefined) {
          visualization.y = response.data.data.position_y;
        }
      }
      
      // Kembalikan visualisasi yang sudah diupdate dengan ID dari database
      return visualization;
    })
    .catch(error => {
      // Tangani error network atau error dari API (status >= 400)
      console.error(
          "Error saving visualization (axios catch):",
          error.response ? { status: error.response.status, data: error.response.data } : error.message
      );
      // Lemparkan kembali error agar pemanggil tahu terjadi kegagalan
      // setIsSaving(false);
      throw error;
    });
}, [selectedVisualization, onVisualizationSelect, setVisualizations]); // Tambahkan setVisualizations sebagai dependensi


  // Fungsi untuk menunda penyimpanan ke API (debounce)
  const queueSaveVisualization = useCallback((visualization) => {
    // Hapus timeout yang sedang berjalan untuk ID ini jika ada
    if (pendingSaveTimeouts[visualization.id]) {
      clearTimeout(pendingSaveTimeouts[visualization.id]);
    }

    console.log(`Queueing save for visualization ID: ${visualization.id}`);
    // Set timeout baru untuk menyimpan setelah delay
    const timeoutId = setTimeout(() => {
      console.log(`Executing delayed save for visualization ID: ${visualization.id}`);
      saveVisualizationToAPI(visualization)
        .catch(error => {
            // Tangani error yang terjadi saat penyimpanan yang tertunda
            console.error(`Failed to save visualization ${visualization.id} after delay:`, error);
            // TODO: Mungkin tampilkan notifikasi ke pengguna bahwa penyimpanan gagal
        })
        .finally(() => {
            // Hapus ID timeout dari state setelah selesai (baik sukses maupun gagal)
            setPendingSaveTimeouts(prev => {
                const newTimeouts = {...prev};
                delete newTimeouts[visualization.id];
                return newTimeouts;
            });
        });
    }, 1500); // Delay 1.5 detik sebelum menyimpan

    // Simpan ID timeout ke state
    setPendingSaveTimeouts(prev => ({
      ...prev,
      [visualization.id]: timeoutId
    }));
  }, [pendingSaveTimeouts, saveVisualizationToAPI]); // Dependensi pada state timeout dan fungsi save API

  // useEffect untuk menambahkan visualisasi baru ketika props berubah
  useEffect(() => {
  // KONDISI SEBELUMNYA: if (query && visualizationType && data && newVisualizationPayload)
  // Ganti dengan yang di bawah ini. Kita tidak memerlukan `data` sebagai pemicu.
  if (query && visualizationType && newVisualizationPayload) {
      const existingVisualization = visualizations.find(
        v => v.query === query && v.type === visualizationType
      );

    if (!existingVisualization) {
      const tempId = generateUniqueId();
      const newTitle = visualizationConfig?.title || `Visualisasi ${visualizationType}`;
      const newType = visualizationType;
      const newQuery = query;

      // AMBIL ID DATASOURCE DARI PAYLOAD, BUKAN DARI `data`
      const datasourceId = data.id_datasource || 1;

      const currentCanvasId = canvases[currentCanvasIndex]?.id;

      if (!currentCanvasId) {
        console.error("Canvas ID is not available.");
        return;
      }

      const newVisualization = {
        id: tempId,
        id_canvas: currentCanvasId,
        id_datasource: datasourceId, // <<< Gunakan datasourceId yang benar
        query: newQuery,
        type: newType,
        title: newTitle,
        config: visualizationConfig || {},
        x: 20,
        y: 20,
        width: 600,
        height: 400,
        builderPayload: newVisualizationPayload,
        requestPayload: {
           id_canvas: currentCanvasId,
           id_datasource: datasourceId, // <<< Gunakan datasourceId yang benar
           query: newQuery,
           visualizationType: newType,
           name: newTitle
        }
      };

      console.log("Adding new visualization to state (from SQL Query):", newVisualization);
      setVisualizations(prev => [...prev, newVisualization]);
      saveVisualizationToAPI(newVisualization).catch(error => {
          console.error("Failed to save newly created visualization immediately:", error);
      });
    } else {
        console.log("Visualization with same query and type already exists. Skipping add.");
    }
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [query, visualizationType, visualizationConfig, saveVisualizationToAPI, newVisualizationPayload]);

  // useEffect untuk mengupdate config visualisasi yang dipilih
  useEffect(() => {
    // Hanya jalan jika ada visualisasi yang dipilih dan config baru
    if (selectedVisualization && visualizationConfig) {
        // Cari index visualisasi yang dipilih di state
        const vizIndex = visualizations.findIndex(v => v.id === selectedVisualization.id);

        if (vizIndex !== -1) {
            const currentViz = visualizations[vizIndex];
            // Cek apakah config benar-benar berubah (perbandingan string JSON)
            if (JSON.stringify(currentViz.config) !== JSON.stringify(visualizationConfig)) {
                console.log(`Config changed for visualization ID: ${selectedVisualization.id}. Updating...`);
                const newTitle = visualizationConfig.title || currentViz.title; // Ambil title dari config baru atau pertahankan yg lama

                // Buat objek visualisasi yang sudah diupdate
                const updatedViz = {
                  ...currentViz,
                  config: visualizationConfig, // Gunakan config baru
                  title: newTitle, // Gunakan title baru
                  // Update requestPayload jika title berubah agar konsisten
                  requestPayload: {
                    ...currentViz.requestPayload,
                    name: newTitle // Update nama di payload
                  }
                };

                // Update state visualizations dengan objek baru
                setVisualizations(prev => [
                    ...prev.slice(0, vizIndex), // Bagian sebelum viz yg diupdate
                    updatedViz,                // Viz yang diupdate
                    ...prev.slice(vizIndex + 1) // Bagian setelah viz yg diupdate
                ]);

                // Jadwalkan penyimpanan perubahan ke API
                queueSaveVisualization(updatedViz);
            }
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visualizationConfig, selectedVisualization, queueSaveVisualization]); // Tidak memasukkan 'visualizations' untuk mencegah loop

  // useEffect untuk handle zoom dengan Ctrl + Scroll
  useEffect(() => {
    const handleWheel = (event) => {
      // Cek apakah tombol Ctrl ditekan
      if (event.ctrlKey) {
        event.preventDefault(); // Mencegah scroll halaman default
        // Update state scale berdasarkan arah scroll
        setScale(currentScale => {
          let newScale = currentScale - event.deltaY * zoomSpeed; // deltaY negatif saat scroll up (zoom in)
          // Batasi scale minimal 0.5 dan maksimal 3
          return Math.min(Math.max(0.5, newScale), 3);
        });
      }
    };

    const container = containerRef.current; // Ambil elemen container
    if (container) {
      // Tambahkan event listener 'wheel' ke container
      container.addEventListener("wheel", handleWheel, { passive: false }); // passive:false agar preventDefault bekerja
    }
    // Cleanup: Hapus event listener saat komponen unmount
    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, [zoomSpeed]); // Hanya bergantung pada zoomSpeed

  // Callback untuk menghandle klik pada area kosong canvas (unselect)
  const handleCanvasClick = useCallback((event) => {
    // Jika target klik adalah elemen canvas itu sendiri (bukan child)
    if (event.target === event.currentTarget) {
      onVisualizationSelect(null); // Panggil prop unselect
    }
  }, [onVisualizationSelect]);

  // useEffect untuk menghandle tombol Escape (unselect)
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Jika tombol yang ditekan adalah 'Escape' dan ada visualisasi yang dipilih
      if (event.key === 'Escape' && selectedVisualization) {
        onVisualizationSelect(null); // Panggil prop unselect
      }
    };

    // Tambahkan event listener 'keydown' ke document
    document.addEventListener('keydown', handleKeyDown);
    // Cleanup: Hapus event listener saat komponen unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedVisualization, onVisualizationSelect]); // Dependensi pada state selection dan fungsi unselect

  // useEffect untuk setup interact.js (drag & resize)
  useEffect(() => {
    if (userAccessLevel === 'view') {
        interact('.visualization-container').unset();
        return;
    }

    // Jangan setup jika masih loading atau belum ada visualisasi
    if (isLoading || visualizations.length === 0) {
        // Jika ada instance interact yg tersisa dari render sebelumnya, coba unset
        interact('.visualization-container').unset();
        return;
    }

    console.log("Setting up interact.js for visualizations...");
    const interactionInstances = []; // Array untuk menyimpan instance interact

    visualizations.forEach(viz => {
      const element = document.getElementById(viz.id); // Dapatkan elemen DOM berdasarkan ID
      if (!element) {
          console.warn(`Element with ID ${viz.id} not found in DOM for interact setup.`);
          return; // Lewati jika elemen tidak ditemukan
      }

      // --- Inisialisasi Posisi & Ukuran Awal ---
      // Set atribut data-* untuk interact.js membaca posisi awal
      element.setAttribute('data-x', viz.x.toString());
      element.setAttribute('data-y', viz.y.toString());
      // Terapkan style awal dari state
      element.style.width = `${viz.width}px`;
      element.style.height = `${viz.height}px`;
      element.style.transform = `translate(${viz.x}px, ${viz.y}px)`;
      element.style.position = 'absolute'; // Pastikan elemen diposisikan absolut
      element.style.touchAction = 'none'; // Rekomendasi interact.js untuk touch devices

      // Setup interact.js untuk elemen ini
      const instance = interact(element)
        .draggable({
          inertia: false, // Nonaktifkan inertia untuk kontrol langsung
          modifiers: [
            interact.modifiers.restrictRect({ // Batasi pergerakan di dalam parent
              restriction: 'parent',
              endOnly: true // Terapkan batasan hanya di akhir drag
            })
          ],
          listeners: {
            // Listener saat drag dimulai
            start: (event) => {
              console.log(`Drag start: ${viz.id}`);
              onVisualizationSelect(viz); // Pilih visualisasi saat drag dimulai
              event.target.classList.add('dragging'); // Tambah class untuk styling
              event.target.style.cursor = 'grabbing'; // Ubah cursor
              event.target.style.zIndex = 20; // Bawa ke depan saat di-drag
            },
            // Listener saat drag bergerak
            move: (event) => {
              const target = event.target;
              // Baca posisi saat ini dari atribut data-*
              let x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx; // Tambahkan perubahan delta X
              let y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy; // Tambahkan perubahan delta Y

              // Terapkan transformasi CSS untuk memindahkan elemen secara visual
              target.style.transform = `translate(${x}px, ${y}px)`;
              // Update atribut data-* dengan posisi baru
              target.setAttribute('data-x', x);
              target.setAttribute('data-y', y);
            },
            // Listener saat drag berakhir
            end: (event) => {
              console.log(`Drag end: ${viz.id}`);
              event.target.classList.remove('dragging'); // Hapus class styling
              event.target.style.cursor = 'grab'; // Kembalikan cursor
              if(!event.target.classList.contains('selected')) {
                 event.target.style.zIndex = 1; // Kembalikan zIndex jika tidak selected
              } else {
                 event.target.style.zIndex = 10; // zIndex untuk selected
              }
              // Baca posisi final dari atribut data-*
              const finalX = parseFloat(event.target.getAttribute('data-x'));
              const finalY = parseFloat(event.target.getAttribute('data-y'));

              // Update state React hanya jika posisi berubah
              setVisualizations(prev =>
                prev.map(v => {
                  if (v.id === viz.id) {
                    // Cek apakah posisi benar-benar berubah untuk menghindari save yg tidak perlu
                    if (v.x !== finalX || v.y !== finalY) {
                       console.log(`Position changed for ${viz.id}. Queuing save.`);
                       const updatedViz = { ...v, x: finalX, y: finalY };
                       queueSaveVisualization(updatedViz); // Jadwalkan penyimpanan
                       return updatedViz; // Kembalikan viz yg sudah diupdate posisinya
                    } else {
                       console.log(`Position not changed for ${viz.id}. Skipping save.`);
                    }
                  }
                  return v; // Kembalikan viz lain tanpa perubahan
                })
              );
            }
          }
        })
        .resizable({
          edges: { left: true, right: true, bottom: true, top: true }, // Aktifkan resize di semua sisi
          invert: 'reposition', // Memungkinkan resize dari sisi kiri/atas dengan benar
          restrictSize: { // Batasi ukuran minimal
            min: { width: 200, height: 150 }
          },
          inertia: false, // Nonaktifkan inertia
          listeners: {
            // Listener saat resize dimulai
            start: (event) => {
              console.log(`Resize start: ${viz.id}`);
              onVisualizationSelect(viz); // Pilih visualisasi saat resize
              event.target.classList.add('resizing'); // Tambah class styling
              event.target.style.zIndex = 20; // Bawa ke depan saat resize
            },
            // Listener saat resize bergerak
            move: (event) => {
              const target = event.target;
              // Baca posisi saat ini dari atribut data-*
              let x = parseFloat(target.getAttribute('data-x') || '0');
              let y = parseFloat(target.getAttribute('data-y') || '0');

              // Terapkan ukuran baru dari event resize
              target.style.width = `${event.rect.width}px`;
              target.style.height = `${event.rect.height}px`;

              // Perbarui posisi berdasarkan perubahan dari interact.js (event.deltaRect)
              // Ini penting untuk handle resize dari kiri/atas
              x += event.deltaRect.left;
              y += event.deltaRect.top;

              // Terapkan transformasi CSS untuk posisi baru
              target.style.transform = `translate(${x}px, ${y}px)`;
              // Update atribut data-* dengan posisi baru
              target.setAttribute('data-x', x);
              target.setAttribute('data-y', y);
            },
            // Listener saat resize berakhir
            end: (event) => {
              console.log(`Resize end: ${viz.id}`);
              event.target.classList.remove('resizing'); // Hapus class styling
              if(!event.target.classList.contains('selected')) {
                 event.target.style.zIndex = 1; // Kembalikan zIndex jika tidak selected
              } else {
                 event.target.style.zIndex = 10; // zIndex untuk selected
              }
              // Baca posisi dan ukuran final
              const finalX = parseFloat(event.target.getAttribute('data-x'));
              const finalY = parseFloat(event.target.getAttribute('data-y'));
              const finalWidth = event.rect.width; // Ambil ukuran dari event.rect
              const finalHeight = event.rect.height;

              // Update state React hanya jika ada perubahan
              setVisualizations(prev =>
                prev.map(v => {
                  if (v.id === viz.id) {
                    // Cek apakah ada perubahan posisi atau ukuran
                    if (v.x !== finalX || v.y !== finalY || v.width !== finalWidth || v.height !== finalHeight) {
                       console.log(`Size/Position changed for ${viz.id}. Queuing save.`);
                       const updatedViz = {
                         ...v,
                         x: finalX,
                         y: finalY,
                         width: finalWidth,
                         height: finalHeight
                       };
                       queueSaveVisualization(updatedViz); // Jadwalkan penyimpanan
                       return updatedViz; // Kembalikan viz yg sudah diupdate
                    } else {
                       console.log(`Size/Position not changed for ${viz.id}. Skipping save.`);
                    }
                  }
                  return v; // Kembalikan viz lain tanpa perubahan
                })
              );
            }
          }
        });
      interactionInstances.push(instance); // Simpan instance untuk cleanup
    });

    // Fungsi cleanup untuk useEffect ini
    return () => {
      console.log("Cleaning up interact.js instances...");
      // Hapus semua instance interact yang telah dibuat
      interactionInstances.forEach(instance => {
          try {
             // interact(instance.target).unset(); // Cara lain unset
             instance.unset(); // Hapus listener dan setup dari elemen target
          } catch (e) {
             console.warn("Error trying to unset interact instance:", e);
          }
      });
      // Alternatif: Hapus semua interactable dengan class tertentu
      // interact('.visualization-container').unset();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visualizations, isLoading, onVisualizationSelect, queueSaveVisualization, userAccessLevel]); // Dependensi penting untuk re-setup interact

  // Callback untuk menghapus visualisasi
  const handleRemoveVisualization = useCallback((id) => {
  console.log(`Attempting to remove visualization ID: ${id}`);
  
  // Dapatkan visualisasi yang akan dihapus
  const vizToRemove = visualizations.find(v => v.id === id);
  
  if (!vizToRemove) {
    console.error(`Visualization with ID ${id} not found for deletion`);
    return;
  }
  
  // Jika visualisasi yang dihapus adalah yang sedang dipilih, unselect dulu
  if (selectedVisualization && selectedVisualization.id === id) {
    onVisualizationSelect(null);
  }

  // Batalkan timeout penyimpanan yang mungkin sedang berjalan untuk ID ini
  if (pendingSaveTimeouts[id]) {
    console.log(`Cancelling pending save for removed visualization ID: ${id}`);
    clearTimeout(pendingSaveTimeouts[id]);
    // Hapus dari state pending timeouts
    setPendingSaveTimeouts(prev => {
      const newTimeouts = {...prev};
      delete newTimeouts[id];
      return newTimeouts;
    });
  }

  // Hapus visualisasi dari state React terlebih dahulu (UI responsiveness)
  setVisualizations(prev => prev.filter(v => v.id !== id));

  // Kirim request DELETE ke API untuk menghapus permanen (atau soft delete di backend)
  axios.delete(`${config.API_BASE_URL}/api/kelola-dashboard/delete-visualization/${id}`)
    .then(response => {
      console.log(`Visualization ID: ${id} deleted from API:`, response.data);
    })
    .catch(error => {
      console.error(`Error deleting visualization ID: ${id} from API:`, error.response ? error.response.data : error.message);
      
      // Jika error berkaitan dengan ID yang tidak ditemukan, coba cek apakah ini ID sementara
      if (error.response && error.response.status === 404) {
        console.warn(`Visualization ID ${id} not found in database. It may be a temporary ID waiting for save.`);
      }
    });
}, [selectedVisualization, onVisualizationSelect, pendingSaveTimeouts, visualizations]);

  // Callback untuk memilih visualisasi saat diklik
  const handleVisualizationClick = useCallback((viz) => {
    console.log(`Visualization clicked: ${viz.id}`);
    onVisualizationSelect(viz); // Panggil prop onVisualizationSelect
  }, [onVisualizationSelect]);

  // Fungsi untuk me-render semua visualisasi
  const renderVisualizations = () => {
    return visualizations.map(viz => {
      // Cek apakah visualisasi ini sedang dipilih
      const isSelected = selectedVisualization && selectedVisualization.id === viz.id;

      // Render div container untuk setiap visualisasi
      return (
        // ... (kode lain di komponen induk) ...
        

<div
  key={viz.id} // Key unik untuk React
  id={viz.id} // ID untuk interact.js dan styling
  className={`visualization-container ${isSelected ? 'selected' : ''}`} // Class untuk styling
  style={{
    width: `${viz.width}px`,
    height: `${viz.height}px`,
    transform: `translate(${viz.x}px, ${viz.y}px)`,
    background: "#fff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    borderRadius: "8px",
    overflow: "hidden", // Konten tidak boleh meluber keluar box
    position: "absolute", // Krusial untuk positioning via transform
    cursor: "grab", // Cursor default
    touchAction: "none", // Rekomendasi interact.js
    borderColor: isSelected ? "hsl(206, 90%, 55%)" : "transparent", // Border saat selected
    borderWidth: "2px",
    borderStyle: "solid",
    zIndex: isSelected ? 10 : 1 // Visualisasi terpilih di atas
  }}
  onClick={(e) => {
    const target = e.target;
    if (target.classList.contains('remove-button') || target.closest('.remove-button')) {
        return; 
    }
    handleVisualizationClick(viz); 
  }}
  data-x={viz.x}
  data-y={viz.y}
>
  {/* Header Visualisasi */}
  <div className="visualization-header" style={{ userSelect: 'none', cursor: 'inherit' }}>
    <h3>{viz.title || `Visualisasi ${viz.type}`}</h3>
    {userAccessLevel !== 'view' && (
      <button
      className="remove-button"
      onClick={(e) => {
        e.stopPropagation(); 
        handleRemoveVisualization(viz.id); 
      }}
      aria-label="Remove visualization" 
      title="Remove visualization" 
    >
      ×
    </button>
    )}
  </div>

  {/* Konten Visualisasi */}
  <div
    className="visualization-content"
    style={{
      // padding: "10px", // <-- HAPUS PADDING INI
      height: `calc(100% - 40px)`, // Tinggi konten = 100% - tinggi header (sesuaikan 40px jika header berubah)
      boxSizing: "border-box", 
      overflow: "hidden" // Biarkan overflow di sini jika konten Visualisasi (misal tabel panjang) memang perlu scroll
                       // Jika chart harus fit sempurna dan tidak scroll, mungkin perlu strategi lain atau overflow: hidden di sini
                       // dan pastikan chart/table/card di dalam Visualisasi menghandle overflow-nya sendiri jika perlu.
                       // Untuk kasus chart autofit, 'hidden' atau membiarkan chart menangani ukurannya lebih baik.
                       // Kita akan buat Visualisasi mengisi 100% height dari ini, jadi overflow: 'hidden' lebih cocok.
    }}
  >
     {/* --- Render Komponen Anak (DataTableComponent atau Visualisasi) --- */}
     {viz.type === 'table' ? (
        <DataTableComponent
          data={data} 
          query={viz.query}
          visualizationType={viz.type}  
        />
     ) : viz.type ? (
        <Visualisasi
          requestPayload={viz.requestPayload} 
          visualizationType={viz.type}        
          visualizationConfig={viz.config}   
          currentCanvasIndex={currentCanvasIndex} 
          currentCanvasId={currentCanvasId}
          data={data} 
          query={viz.query}
        />
     ) : (
        <p style={{ color: 'red', padding: '10px' }}>Tipe visualisasi tidak valid atau tidak ditemukan.</p>
     )}
  </div>
</div>

// ... (sisa kode komponen induk) ...
      );
    });
  };

  // Tampilan Loading Awal
  if (isLoading && visualizations.length === 0) {
    return (
      <main className="canvas-container" ref={containerRef}>
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading visualizations...</p>
        </div>
      </main>
    );
  }

  // Render Utama Canvas
  return (
  <main className="canvas-container" ref={containerRef}>
    {/* Overlay abu-abu saat sedang dalam proses */}
    {/* {isSaving || isLoading ? (
      <div className="overlay active">
        <div className="spinner"></div>
        <p>Processing...</p>
      </div>
    ) : null} */}

    <div
      className="canvas"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "center",
        position: "relative",
        minWidth: "1200px",
        minHeight: "800px",
        overflow: "visible",
        border: "1px solid #d9d9d9",
        // pointerEvents: isSaving ? 'none' : 'auto' // Nonaktifkan interaksi saat menyimpan
      }}
      onClick={handleCanvasClick}
    >
      {visualizations.length === 0 && !isLoading ? (
        <div className="empty-state">
          <p>Tidak ada visualisasi di canvas.</p>
          <p>Untuk menambahkan, atur data dan pilih tipe visualisasi dari sidebar.</p>
        </div>
      ) : (
        renderVisualizations()
      )}
    </div>
  </main>
);
};

export default Canvas;