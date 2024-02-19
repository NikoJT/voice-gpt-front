import React, { useState } from "react";
import Title from "./Title";
import Recorder from "./Recorder";

const Controller = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);

    const createBlobUrl = (data: any) => {
        const blob = new Blob([data], { type: "audio/mpeg"});
        const url = window.URL.createObjectURL(blob);
        return url;
    };

    const handleStop = (blobUrl: string) => {
        setIsLoading(true);

        const myMessage = { sender: "me", blobUrl };
        const messagesArr: any[] = [...messages, myMessage];

        fetch(blobUrl)
            .then((res) => res.blob())
            .then(async (blob) => {
                const formData = new FormData();
                formData.append("file", blob, "myFile.wav");
                const requestOptions = {
                    method: "POST",
                    body: formData,
                  };
                  await fetch("http://localhost:8000/post-audio", requestOptions)
                  .then(async (res) => {
                      const blob = await res.blob();
                      const audio = new Audio();
                      audio.src = createBlobUrl(blob);
              
                      const alexandraMessage = {sender: "Alexandra", blobUrl: audio.src };
                      messagesArr.push(alexandraMessage);
                      setMessages(messagesArr);
              
                      setIsLoading(false);
                      audio.play();
                  })
                  .catch((e) => {
                      console.error(e.message);
                      setIsLoading(false);
                  });
        });
    };

    return (
        <div className="h-screen overflow-y-hidden">
            <Title setMessages={setMessages} />
            <div className="flex flex-col justify-between h-full overflow-y-scroll pb-96">
                <div className="mt-5 px-5">
                    {messages.map((audio, index) => {
                        return <div key={index + audio.sender} className={"flex flex-col " + (audio.sender === "Alexandra" && "flex items-end")}>
                            <div className="mt-4">
                                <p className={audio.sender === "Alexandra" ? "text-right mr-2 italic text-green-500":"ml-2 italic text-blue-500"}>
                                    {audio.sender}
                                </p>
                                <audio src={audio.blobUrl} className="appearance-none" controls />
                            </div>
                        </div>
                    })}
                    {messages.length === 0 && !isLoading && (
                        <div className="text-center font-light italic mt-10">Send Alexandra a message...</div>
                    )}

                    {isLoading &&  (
                        <div className="text-center font-light italic mt-10 animate-pulse"> Give me a few seconds...</div>
                    )}
                </div>
                <div className="fixed bottom-0 w-full py-6 border-t text-center bg-gradient-to-r from-sky-500 to-green-500">
                    <div className="flex justify-center items-center w-full">
                        <Recorder handleStop={handleStop} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Controller;