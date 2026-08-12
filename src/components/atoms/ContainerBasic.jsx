const ContainerBasic = ({ children, className = '' }) => {
    return ( 
        <div className={`max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
            { children }
        </div>
    );
}
 
export default ContainerBasic;