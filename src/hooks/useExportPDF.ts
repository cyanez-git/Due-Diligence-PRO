import { useState, useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { InformeCompleto } from '@/types';

export function useExportPDF() {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const exportarAPDF = useCallback(async (
    informe: InformeCompleto,
    elementId: string = 'informe-content'
  ): Promise<void> => {
    setExporting(true);
    setProgress(0);

    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Elemento no encontrado para exportar');
      }

      setProgress(20);

      // El elemento existe, proceder con la generación del PDF
      // Nota: En una implementación futura, se puede usar html2canvas para
      // capturar el DOM como imagen y agregarla al PDF
      void html2canvas; // Referencia para evitar error de unused import
      void element;

      setProgress(60);

      // Configurar PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Agregar portada
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pdfWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.text('INFORME DE DUE DILIGENCE', pdfWidth / 2, 20, { align: 'center' });
      pdf.setFontSize(14);
      pdf.text(informe.empresa.nombre.toUpperCase(), pdfWidth / 2, 30, { align: 'center' });

      // Agregar información de la empresa
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      let yPos = 50;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INFORMACIÓN DE LA EMPRESA', 15, yPos);
      pdf.setFont('helvetica', 'normal');
      yPos += 8;

      const infoData = [
        ['CUIT:', informe.empresa.cuit],
        ['Tipo:', informe.empresa.tipo === 'publica' ? 'Pública' : 'Privada'],
        ['Sector:', informe.empresa.sector],
        ['País:', informe.empresa.pais],
        ['Empleados:', informe.empresa.empleados || 'No especificado'],
        ['Año de Fundación:', informe.empresa.fechaFundacion || 'No especificado'],
      ];

      infoData.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label as string, 15, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value as string, 60, yPos);
        yPos += 6;
      });

      // Resultado del análisis
      yPos += 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RESULTADO DEL ANÁLISIS', 15, yPos);
      yPos += 8;

      const { resultado } = informe;
      
      // Puntaje con color
      const porcentaje = resultado.porcentaje;
      let color: [number, number, number];
      if (porcentaje >= 75) color = [16, 185, 129]; // verde
      else if (porcentaje >= 50) color = [245, 158, 11]; // amarillo
      else color = [239, 68, 68]; // rojo

      pdf.setFillColor(color[0], color[1], color[2]);
      pdf.circle(30, yPos + 5, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.text(`${porcentaje}%`, 30, yPos + 7, { align: 'center' });

      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      
      let recomendacionTexto = '';
      if (resultado.recomendacion === 'aprobado') recomendacionTexto = 'APROBADO';
      else if (resultado.recomendacion === 'condicional') recomendacionTexto = 'APROBADO CON CONDICIONES';
      else recomendacionTexto = 'RECHAZADO';

      pdf.text(recomendacionTexto, 50, yPos + 5);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text(`Puntaje: ${resultado.puntajeTotal} / ${resultado.puntajeMaximo} puntos`, 50, yPos + 10);

      // Nueva página para la tabla de temperatura
      pdf.addPage();
      yPos = 20;

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TABLA DE TEMPERATURA - DUE DILIGENCE', pdfWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Tabla de items
      const itemsPorCategoria: Record<string, typeof resultado.items> = {};
      resultado.items.forEach(item => {
        if (!itemsPorCategoria[item.categoria]) {
          itemsPorCategoria[item.categoria] = [];
        }
        itemsPorCategoria[item.categoria].push(item);
      });

      const categoriasNombres: Record<string, string> = {
        legal: 'Legal y Regulatorio',
        financiero: 'Financiero',
        operacional: 'Operacional',
        mercado: 'Mercado y Competencia',
        tecnologia: 'Tecnología e Innovación',
        sostenibilidad: 'ESG y Sostenibilidad',
      };

      Object.entries(itemsPorCategoria).forEach(([categoria, items]) => {
        // Verificar si hay espacio en la página
        if (yPos > pdfHeight - 40) {
          pdf.addPage();
          yPos = 20;
        }

        pdf.setFillColor(241, 245, 249);
        pdf.rect(15, yPos - 5, pdfWidth - 30, 8, 'F');
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(categoriasNombres[categoria] || categoria, 17, yPos);
        yPos += 10;

        items.forEach(item => {
          if (yPos > pdfHeight - 20) {
            pdf.addPage();
            yPos = 20;
          }

          // Color del semáforo
          let semaforoColor: [number, number, number];
          if (item.estado === 'aprobado') semaforoColor = [16, 185, 129];
          else if (item.estado === 'revisar') semaforoColor = [245, 158, 11];
          else semaforoColor = [239, 68, 68];

          pdf.setFillColor(semaforoColor[0], semaforoColor[1], semaforoColor[2]);
          pdf.circle(20, yPos + 2, 3, 'F');

          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.text(item.item, 28, yPos);
          
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          const descripcionLines = pdf.splitTextToSize(item.descripcion, pdfWidth - 60);
          pdf.text(descripcionLines, 28, yPos + 4);
          
          pdf.setFontSize(8);
          pdf.text(`Puntaje: ${item.puntaje}/10`, pdfWidth - 35, yPos);

          yPos += 12 + (descripcionLines.length - 1) * 3;
        });

        yPos += 5;
      });

      // Nueva página para resumen ejecutivo
      pdf.addPage();
      yPos = 20;

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RESUMEN EJECUTIVO', pdfWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const resumenLines = pdf.splitTextToSize(resultado.resumenEjecutivo, pdfWidth - 30);
      pdf.text(resumenLines, 15, yPos);
      yPos += resumenLines.length * 5 + 15;

      // Datos del research
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DATOS DEL RESEARCH', 15, yPos);
      yPos += 10;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      
      // Noticias
      pdf.setFont('helvetica', 'bold');
      pdf.text('Noticias Recientes:', 15, yPos);
      yPos += 5;
      pdf.setFont('helvetica', 'normal');
      
      informe.research.noticias.slice(0, 3).forEach((noticia, index) => {
        if (yPos > pdfHeight - 30) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.setFontSize(8);
        pdf.text(`${index + 1}. ${noticia.titulo} (${noticia.fecha})`, 20, yPos);
        yPos += 4;
        const resumenLines = pdf.splitTextToSize(noticia.resumen, pdfWidth - 40);
        pdf.text(resumenLines, 25, yPos);
        yPos += resumenLines.length * 3 + 3;
      });

      // Riesgos identificados
      yPos += 5;
      if (yPos > pdfHeight - 40) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Riesgos Identificados:', 15, yPos);
      yPos += 5;
      pdf.setFont('helvetica', 'normal');

      informe.research.riesgos.forEach((riesgo) => {
        if (yPos > pdfHeight - 20) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.setFontSize(8);
        
        let riesgoColor: [number, number, number];
        if (riesgo.nivel === 'alto') riesgoColor = [239, 68, 68];
        else if (riesgo.nivel === 'medio') riesgoColor = [245, 158, 11];
        else riesgoColor = [16, 185, 129];

        pdf.setTextColor(riesgoColor[0], riesgoColor[1], riesgoColor[2]);
        pdf.text(`[${riesgo.nivel.toUpperCase()}]`, 20, yPos);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`${riesgo.categoria}: ${riesgo.descripcion}`, 45, yPos);
        yPos += 5;
      });

      // Pie de página
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(
          `Due Diligence Pro - ${informe.empresa.nombre} - Página ${i} de ${totalPages}`,
          pdfWidth / 2,
          pdfHeight - 10,
          { align: 'center' }
        );
        pdf.text(
          `Generado el: ${new Date().toLocaleDateString('es-ES')}`,
          pdfWidth / 2,
          pdfHeight - 5,
          { align: 'center' }
        );
      }

      setProgress(100);

      // Guardar PDF
      pdf.save(`DueDiligence_${informe.empresa.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (err) {
      console.error('Error exportando PDF:', err);
      throw err;
    } finally {
      setExporting(false);
      setProgress(0);
    }
  }, []);

  return { exportarAPDF, exporting, progress };
}
