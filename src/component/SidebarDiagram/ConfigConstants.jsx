import column from "../../assets/img/charts/column.png";
import line from "../../assets/img/charts/lines.png";
import pie from "../../assets/img/charts/pie.png";
import table from "../../assets/img/charts/table-v2.png";
import donut from "../../assets/img/charts/donut.png";
import card from "../../assets/img/charts/card.png";

export const DEFAULT_CONFIG = {
  colors: ["#4CAF50", "#FF9800", "#2196F3"],
  title: "Visualisasi Data",
  titleFontSize: 18,
  titleFontColor: "#333333",
  titleFontFamily: "Arial",
  titlePosition: "center",
  titleBackgroundColor: "#ffffff",
  titleFontStyle: "normal",

  subtitle: "Sub Judul Visualisasi",
  subtitleFontSize: 14,
  subtitleFontFamily: "Arial",
  subtitleFontColor: "#333333",
  subtitlePosition: "center",
  subtitleBackgroundColor: "#ffffff",
  subtitleTextStyle: "normal",

  fontSize: 14, // Legend Font Size
  fontFamily: "Arial", // Legend Font Family
  fontColor: "#000000", // Legend Font Color

  gridColor: "#E0E0E0",
  gridType: "solid",

  backgroundColor: "#ffffff",

  xAxisFontSize: 12,
  xAxisFontFamily: "Arial",
  xAxisFontColor: "#000000",

  yAxisFontSize: 12,
  yAxisFontFamily: "Arial",
  yAxisFontColor: "#000000",

  pattern: "solid", // Chart pattern

  categoryTitle: "Kategori", // X-Axis Title
  categoryTitleFontSize: 14,
  categoryTitleFontFamily: "Arial",
  categoryTitleFontColor: "#000000",
  categoryTitlePosition: "center",
  categoryTitleBackgroundColor: "#ffffff",
  categoryTitleTextStyle: "normal",

  showValue: true,
  valuePosition: "top",
  valueFontColor: "#000000",
  valueOrientation: "horizontal",

  borderColor: "#000000",
  borderWidth: 1,
  borderType: "solid",
};

export const visualizationOptions = [
  { type: "bar", label: "Batang", image: column },
  { type: "line", label: "Line", image: line },
  { type: "pie", label: "Pie", image: pie },
  { type: "donut", label: "Donut", image: donut },
  { type: "", label: "Tabel", image: table }, 
  { type: "card", label: "Card", image: card }, 
];