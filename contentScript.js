
function getFormattedContent() {

    const pageTitle = document.title;
    let mainContent = "";
    const articleElement = document.querySelector('article');
    const mainElement = document.querySelector('main');
    // incase there not so much text 
    if(articleElement){
        mainContent = articleElement.innerText;
    }else if(mainElement){
        mainContent = mainElement.innerText;
    }else{
        const bodyText = document.body.innerText;
        mainContent = bodyText;
    }

    const formattedContent = {
        title: pageTitle,
        content: mainContent,
        url: window.location.href
    };
    
    return formattedContent;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.action==="extractText"){
        sendResponse({ data: getFormattedContent() });
    }
});