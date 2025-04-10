import React, { useEffect, useRef } from 'react';
import { WebContainer } from '@webcontainer/api';
import { files } from './files';

let webcontainerInstance: WebContainer;

const WebContainerCodeEditor: React.FC = () => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const initializeWebContainer = async () => {
            // Call only once
            webcontainerInstance = await WebContainer.boot();
            console.log('WebContainer initialized:', webcontainerInstance);

            await webcontainerInstance.mount(files);
            const packageJSON = await webcontainerInstance.fs.readFile('package.json', 'utf-8');
            console.log(packageJSON);

            // Install dependencies using pnpm
            const installProcess = await webcontainerInstance.spawn('pnpm', ['install']);
            installProcess.output.pipeTo(new WritableStream({
                write(data) {
                    console.log(data);
                }
            }));
            await installProcess.exit;
            console.log('Dependencies installed using pnpm');

            // Set the textarea value to the contents of files['index.js']
            if (textareaRef.current) {
                textareaRef.current.value = files['index.js'].file.contents;
            }

            // Start the development server
            startDevServer();
        };

        const startDevServer = async () => {
            // Run `npm run start` to start the Express app
            const startProcess = await webcontainerInstance.spawn('npm', ['run', 'start']);
            startProcess.output.pipeTo(new WritableStream({
                write(data) {
                    console.log(data);
                }
            }));

            // Wait for `server-ready` event
            webcontainerInstance.on('server-ready', (port, url) => {
                console.log(`Server ready at ${url}`);
                if (iframeRef.current) {
                    console.log('Setting iframe src to:', url);
                    // Set the iframe src to the server URL
                    iframeRef.current.src = url;
                }
            });
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
                <iframe
                    ref={iframeRef}
                    className="h-full w-full rounded-lg"
                    src="loading.html"
                    title="Preview"
                ></iframe>
            </div>
        </div>
    );
};

export default WebContainerCodeEditor;