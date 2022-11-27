class LocalStoragePersistence {
    save(state) {
        console.log(`will save`, state);
        localStorage.setItem("todoState", JSON.stringify(state));
    }
    async load() {
        const todoState = localStorage.getItem("todoState");
        return JSON.parse(todoState);
    }
}
class FileSystemPersistence {
    save(state) {
        download(JSON.stringify(state), "todoDB");
    }
    async load() {
        try {
            const fileContent = (await upload());
            const parsedContent = JSON.parse(fileContent);
            return parsedContent;
        }
        catch (err) {
            console.log(err);
        }
    }
}
function upload() {
    return new Promise((resolve, reject) => {
        const input = document.createElement("input");
        input.type = "file";
        input.onchange = (e) => {
            // getting a hold of the file reference
            const file = e.target.files[0];
            // setting up the reader
            const reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            // here we tell the reader what to do when it's done reading...
            reader.onload = (readerEvent) => {
                const content = readerEvent.target.result; // this is the content!
                if (content) {
                    resolve(content);
                }
                else {
                    reject("ERROR WHEN LOADING FILE");
                }
            };
        };
        input.click();
    });
}
function download(data, filename) {
    // data is the string type, that contains the contents of the file.
    // filename is the default file name, some browsers allow the user to change this during the save dialog.
    // Note that we use octet/stream as the mimetype
    // this is to prevent some browsers from displaying the
    // contents in another browser tab instead of downloading the file
    const blob = new Blob([data], { type: "octet/stream" });
    //IE 10+
    if (window.navigator.msSaveBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else {
        //Everything else
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.href = url;
        a.download = filename;
        setTimeout(() => {
            //setTimeout hack is required for older versions of Safari
            a.click();
            //Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }, 1);
    }
}
export { FileSystemPersistence, LocalStoragePersistence };
