import { Injectable } from '@angular/core';
import { PRIORITY_LABEL, STATUS_LABEL, Task } from '../models/models';
 
const HEADER = ['ID', 'Título', 'Estado', 'Prioridad', 'Asignada a', 'Creada'];
 





/** Con este servicio, como no tenía ni idea de como hacer para que se pudiera descargar y exporta como un informe PDF y CSV, he necesitado ayuda de la ia y de internet
Después de mirarlo, ahora si que he conseguido que se pueda generar y descargar informes de tareas en formato CSV y PDF
El CSV es texto plano con valores separados por un delimitador, en este caso el punto y coma
Para descargar un archivo generado en el navegador se crea un Blob, se obtiene una URL temporal y se simula el click en un enlace con atributo download
En resumen, es como cuando pulsas en descargar, se abre una nueva ventana y se te descarga */
@Injectable({ providedIn: 'root' })
export class ExportService {

  /* Lo primero que se hace es conviertir las tareas en filas de texto ya traducidas */
  toRows(tasks: Task[]): string[][] {
    return tasks.map((t) => [
      String(t.id),
      t.title,
      STATUS_LABEL[t.status],
      PRIORITY_LABEL[t.priority],
      t.profiles?.full_name ?? '',
      t.created_at.slice(0, 10),
    ]);
  }
 


  /* Protege una celda: comillas si hace falta y neutraliza posibles fórmulas */
  /* Haciéndolo así, si una celda empieza por =, +, - o @, ya no hay peligro de que Excel pueda ejecutarlo como una fórmula */
  escapeCell(value: string): string {
    let text = value;
    if (/^[=+\-@]/.test(text)) {
      text = `'${text}`;
    }
    return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }
 

  /* Luego construye el contenido del CSV */
  buildCsv(tasks: Task[]): string {
    return [HEADER, ...this.toRows(tasks)]
      .map((row) => row.map((cell) => this.escapeCell(cell)).join(';')) /* El punto y coma es un delimitador */
      .join('\r\n');
  }
 



  /* Y ya por último descarga el informe en CSV */
  exportCsv(tasks: Task[]): void {
    const blob = new Blob(['\uFEFF' + this.buildCsv(tasks)], { type: 'text/csv;charset=utf-8' });
    this.download(blob, 'tareas.csv');
  }
 


  /* Para el informe del PDF lo descarga con cabecera, tabla paginada y numeración de páginas */
  async exportPdf(tasks: Task[], author = ''): Promise<void> {
    const [{ jsPDF }, autoTableModule] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]);
    const autoTable = autoTableModule.default;
 
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' }); /* Genera el documento con el formato que he establecido */
    const generated = new Date().toLocaleString('es-ES');
 
    doc.setFontSize(20);
    doc.setTextColor(30, 64, 175);
    doc.text('TaskHub · Informe de tareas', 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    doc.text(`Generado el ${generated}${author ? ' por ' + author : ''}`, 14, 25);
    doc.text(`Total de tareas: ${tasks.length}`, 14, 30);
 
    autoTable(doc, { /* Lo que hace es dibujar tablas paginadas */
      startY: 36,
      head: [HEADER],
      body: this.toRows(tasks),
      styles: { fontSize: 9, cellPadding: 2.5 },
      headStyles: { fillColor: [30, 64, 175], textColor: 255 },
      alternateRowStyles: { fillColor: [243, 244, 246] },
      columnStyles: { 0: { cellWidth: 16 } },
    });
 
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text(`Página ${i} de ${pages}`, doc.internal.pageSize.getWidth() - 14, 200, {
        align: 'right',
      });
    }
 
    doc.save('tareas.pdf');
  }
 

  
  private download(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob); /* Se encarga de crear la URL temporal */
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}
