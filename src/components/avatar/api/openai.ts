import {Message} from '../types/avatar';

export const getChatCompletion = async (
        azureOpenAIEndpoint: string,
        azureOpenAIApiKey: string,
        azureOpenAIDeploymentName: string,
        messageHistory: Message[]
    ): Promise<Message> => {
        const url = `${azureOpenAIEndpoint}/openai/deployments/${azureOpenAIDeploymentName}/chat/completions?api-version=2023-06-01-preview`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'api-key': azureOpenAIApiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: messageHistory,
                    tool_choice: {"type": "function", "function": {"name": "guest_answer"}},
                    tools: [{
                        type: "function",
                        function: {
                            "name": "guest_answer",
                            "description": "Generate talking for one of user friends.",
                            "parameters": {
                                "type": "object",
                                "properties": {
                                    "from": {
                                        "type": "string",
                                        "description": "The friends username that is talking",

                                    },
                                    "to": {
                                        "type": "string",
                                        "description": "Always talk to the user.",
                                        "enum": ["user"]
                                    },
                                    "content": {
                                        "type": "string",
                                        "description": "The content the friends is talking."
                                    }
                                },
                                "required": [
                                    "from",
                                    "to",
                                    "content",
                                ]
                            }
                        }
                    }]
                }),
            });

            if (!response.ok) {
                throw new Error(`Chat API response status: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0].message;
        } catch
            (error) {
            console.error('Error in getChatCompletion:', error);
            return {
                role: 'assistant',
                content: "I'm sorry, I encountered an error while processing your request. Please try again.",
            };
        }
    }
;
