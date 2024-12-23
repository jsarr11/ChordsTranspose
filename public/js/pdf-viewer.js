// pdf-viewer.js

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.8.335/pdf.worker.min.js';

const urlParams = new URLSearchParams(window.location.search);
const pdfUrl = `/pdfs/${urlParams.get('pdf')}`;

let pdfDoc = null;
let pageNum = 1;
let pageIsRendering = false;
let pageNumIsPending = null;

const pdfContainer = document.getElementById('pdfContainer');
const prevButton = document.getElementById('prevPage');
const nextButton = document.getElementById('nextPage');

const renderPage = (num) => {
    pageIsRendering = true;
    pdfDoc.getPage(num).then(page => {
        const viewport = page.getViewport({ scale: 1 });
        const scale = pdfContainer.clientWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;

        pdfContainer.innerHTML = '';
        pdfContainer.appendChild(canvas);

        const renderCtx = {
            canvasContext: context,
            viewport: scaledViewport,
        };

        const renderTask = page.render(renderCtx);
        renderTask.promise.then(() => {
            pageIsRendering = false;

            if (pageNumIsPending !== null) {
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        });
    }).catch(err => {
        console.error('Error rendering page:', err);
        pdfContainer.innerHTML = `<p>Error rendering page: ${err.message}</p>`;
    });
};

const queueRenderPage = (num) => {
    if (pageIsRendering) {
        pageNumIsPending = num;
    } else {
        renderPage(num);
    }
};

const showPrevPage = () => {
    if (pageNum <= 1) return;
    pageNum--;
    queueRenderPage(pageNum);
};

const showNextPage = () => {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    queueRenderPage(pageNum);
};

pdfjsLib.getDocument(pdfUrl).promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;
    renderPage(pageNum);
}).catch(err => {
    console.error('Error loading PDF:', err);
    pdfContainer.innerHTML = `<p>Error loading PDF: ${err.message}</p>`;
});

prevButton.addEventListener('click', showPrevPage);
nextButton.addEventListener('click', showNextPage);
