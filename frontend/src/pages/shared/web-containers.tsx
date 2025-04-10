import React, { useEffect, useRef } from 'react';
import { WebContainer } from '@webcontainer/api';
import { files } from './files';

let webcontainerInstance: WebContainer;

const WebContainerCodeEditor: React.FC = () => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const initializeWebContainer = async () => {
            // Call only once
            webcontainerInstance = await WebContainer.boot();
            console.log('WebContainer initialized:', webcontainerInstance);

            await webcontainerInstance.mount(files);
            const packageJSON = await webcontainerInstance.fs.readFile('package.json', 'utf-8');
            console.log(packageJSON);

            // Set the textarea value to the contents of files['index.js']
            if (textareaRef.current) {
                textareaRef.current.value = files['index.js'].file.contents;
            }
        };

        initializeWebContainer();
    }, []);

    return (
        <div className="grid grid-cols-2 gap-4 h-screen w-full">
            <div className="editor">
                <textarea
                    ref={textareaRef}
                    className="w-full h-full resize-none rounded-lg bg-black text-white p-2"
                >
                    I am a textarea
                </textarea>
            </div>
            <div className="preview">
                <iframe className="h-full w-full rounded-lg" src="loading.html" title="Preview"></iframe>
            </div>
        </div>
    );
};

export default WebContainerCodeEditor;