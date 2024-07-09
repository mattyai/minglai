import {useRef, useState} from 'react';
import {Message} from '../types/avatar';
import {getChatCompletion} from '../api/openai';
import {system} from "../../../prompts/system.ts";
import {userIntro} from "../../../prompts/user-intro.ts";

export const useAvatarMessages = (props: {
    azureOpenAIEndpoint: string;
    azureOpenAIApiKey: string;
    azureOpenAIDeploymentName: string;
    onNewMessage: (from: string, message: string) => void;
}) => {
    const isHandlingMessage = useRef(false);

    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'system',
            content: system
        },
        {
            role: 'user',
            content: userIntro,
        }
    ]);

    const handleSendMessage = async (message: string, imageUrl: string) => {
        if (isHandlingMessage.current) {
            return;
        }
        isHandlingMessage.current = true;

        const lastMessage = messages[messages.length - 1];

        let userMessage: Message;

        if (lastMessage.role === 'assistant' && lastMessage.tool_calls) {
            const toolCall = lastMessage.tool_calls.find((toolCall) => toolCall.function.name === 'guest_answer');
            if (toolCall) {
                userMessage = {
                    role: "tool",
                    name: 'guest_answer',
                    tool_call_id: toolCall.id,
                    content: message,
                };
            }
        } else {
            userMessage = {
                role: 'user',
                content: imageUrl
                    ? [
                        {type: 'text', text: message},
                        {type: 'image_url', image_url: {url: imageUrl}},
                    ]
                    : message,
            };
        }

        const assistantReply = await getChatCompletion(
            props.azureOpenAIEndpoint,
            props.azureOpenAIApiKey,
            props.azureOpenAIDeploymentName,
            [...messages, userMessage]
        );

        if (assistantReply.tool_calls) {
            assistantReply.tool_calls.forEach((toolCall) => {
                if (toolCall.function.name === 'guest_answer') {
                    const {from, content} = JSON.parse(toolCall.function.arguments);
                    props.onNewMessage(from, content);
                    assistantReply.content = content;
                }
            });
        }

        setMessages((prevMessages) => {
            return [...prevMessages, userMessage, assistantReply]
        });
        isHandlingMessage.current = false;
    };

    return {
        messages,
        handleSendMessage,
    };
};
