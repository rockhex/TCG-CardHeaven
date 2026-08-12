import ContainerBasic from "./ContainerBasic";

const Hero = ({ heroImage, children }) => {
    return ( 
        <div className="min-h-120 lg:min-h-155 w-full flex items-center justify-center relative">
            {/* Background image with 40% opacity */}
            <div 
                className="absolute inset-0" 
                style={{ 
                    backgroundImage: `url(${heroImage})`, 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center',
                    opacity: 0.4
                }}
            />
            {/* Content with normal opacity */}
            <ContainerBasic>
                <div className="relative z-1 flex items-center justify-center w-full h-full flex-col gap-4 max-w-2xl">
                    {children}
                </div>
            </ContainerBasic>
        </div>
     );
}

export default Hero;