export const requestPayload = {
  query: `
    SELECT pelatihan.nama_pelatihan, COUNT(pendaftar.id_pendaftar) AS total_pendaftar
    FROM pelatihan
    JOIN agenda_pelatihan ON pelatihan.id_pelatihan = agenda_pelatihan.id_pelatihan
    JOIN pendaftaran_event ON agenda_pelatihan.id_agenda = pendaftaran_event.id_agenda
    JOIN pendaftar ON pendaftaran_event.id_peserta = pendaftar.id_pendaftar
    GROUP BY pelatihan.nama_pelatihan
  `,
  chartType: "line", // Bisa diganti dengan "line", "pie", "donut", "area", dll
};

