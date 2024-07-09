import React, {createContext, ReactNode, useContext, useEffect, useMemo, useState} from 'react';

export interface AzureAPIConfig {
    speechRegion: string;
    speechSubscriptionKey: string;
    speechPrivateEndpoint?: string;
    speechEnablePrivateEndpoint?: boolean;

    azureOpenAIEndpoint: string;
    azureOpenAIApiKey: string;
    azureOpenAIDeploymentName: string;
}

interface MultiAvatarContextType {
    azureAPIConfig: AzureAPIConfig;
}

const MultiAvatarContext = createContext<MultiAvatarContextType | undefined>(undefined);

interface MultiAvatarProviderProps {
    children: ReactNode;
    azureAPIConfig: AzureAPIConfig;
}

export const AzureAPIProvider: React.FC<MultiAvatarProviderProps> = ({children, azureAPIConfig}) => {
    const [isSpeechSdkLoaded, setIsSpeechSdkLoaded] = useState(false);

    useEffect(() => {
        const loadSpeechSdk = () => {
            const script = document.createElement('script');
            script.src = 'https://aka.ms/csspeech/jsbrowserpackageraw';
            script.async = true;
            script.onload = () => {
                console.log('Speech SDK loaded and ready to use');
                setIsSpeechSdkLoaded(true);
            };
            document.body.appendChild(script);

            return () => {
                document.body.removeChild(script);
            };
        };

        loadSpeechSdk();
    }, []);


    const contextValue = useMemo(() => ({
        isSpeechSdkLoaded,
        azureAPIConfig,
    }), [isSpeechSdkLoaded, azureAPIConfig]);

    if (!isSpeechSdkLoaded) {
        return <div>Speech SDK is not loaded yet</div>;
    }

    return (
        <MultiAvatarContext.Provider value={contextValue}>
            {children}
        </MultiAvatarContext.Provider>
    );
};

export const useAzureAPIContext = () => {
    const context = useContext(MultiAvatarContext);
    if (context === undefined) {
        throw new Error('useAzureAPIContext must be used within a MultiAvatarProvider');
    }
    return context;
};
