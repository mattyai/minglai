import React, {useRef, useState} from 'react';
import {Message} from "./types/avatar.ts";
import {Button, Input} from "./components.tsx";

interface AvatarChatProps {
    messages: Message[];
    onSendMessage: (message: string, imageUrl: string) => void;
    isSpeaking: boolean;
    sessionActive: boolean;
}

export const AvatarChat: React.FC<AvatarChatProps> = ({messages, onSendMessage}) => {
    const [userInput, setUserInput] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const chatHistoryRef = useRef<HTMLDivElement>(null);

    const handleUserInput = () => {
        if (!userInput.trim() && !imageUrl) return;
        onSendMessage(userInput, imageUrl);
        setUserInput('');
        setImageUrl('');
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="w-full">
            <div
                ref={chatHistoryRef}
                className="h-64 overflow-y-auto border border-gray-300 rounded p-2 mb-2"
            >
                {messages.map((message, index) => (
                    index === 0 ? null :

                        <div key={index} className={`mb-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded ${message.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {typeof message.content === 'string'
                  ? message.content
                  : message.content?.map((content, i) =>
                      content.type === 'text'
                          ? <span key={i}>{content.text}</span>
                          :
                          <img key={i} src={content.image_url?.url} alt="User uploaded" className="max-w-xs max-h-xs"/>
                  )
              }
            </span>
                        </div>
                ))}
            </div>
            <div className="flex">
                <Input
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleUserInput()}
                    placeholder="Type your message..."
                    className="flex-grow mr-2"
                />
                <Button onClick={handleUserInput}>
                    Send
                </Button>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    style={{display: 'none'}}
                />
                <label htmlFor="image-upload" className="ml-2 cursor-pointer">
                    Upload
                </label>
            </div>
        </div>
    );
};
