import './App.css';
import {AzureAPIConfig, AzureAPIProvider} from "./context/AzureAPIProvider";
import {Meeting} from "./Meeting";
import {ConversationProvider} from "./context/ConversationContext";

const azureAPIConfig: AzureAPIConfig = {
    speechRegion: "westeurope",
    speechSubscriptionKey: import.meta.env.VITE_SPEECH_SUBSCRIPTION_KEY as string,

    azureOpenAIApiKey: import.meta.env.VITE_AZURE_OPENAI_API_KEY as string,
    azureOpenAIEndpoint: import.meta.env.VITE_AZURE_OPENAI_ENDPOINT as string,
    azureOpenAIDeploymentName: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME as string,
};

export const App = () => {
    return (
        <AzureAPIProvider azureAPIConfig={azureAPIConfig}>
            <ConversationProvider>
                <Meeting/>
            </ConversationProvider>
        </AzureAPIProvider>
    )
}
