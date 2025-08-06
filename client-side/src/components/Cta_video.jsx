const Cta_video = () => {
    return (
        <div className="bg-gray-950" id="about" >
            <div className="mx-auto max-w-7xl py-15 sm:px-6 sm:py-10 lg:px-8">
               
                <div className="relative isolate overflow-hidden bg-gray-950 px-6 pt-16 shadow-2xl sm:rounded-3xl sm:px-16 md:pt-24 flex lg:gap-x-20 lg:px-24 lg:pt-0 videos-div">
                    <svg
                        viewBox="0 0 1024 1024"
                        aria-hidden="true"
                        className="absolute top-1/5  left-1/2 -z-10 size-256 -translate-y-1/2 mask-[radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0 circleSvg"
                    >
                        <circle r={512} cx={512} cy={512} fill="url(#759c1415-0410-454c-8f7c-9a820de03641)" fillOpacity="0.7" />
                        <defs>
                            <radialGradient id="759c1415-0410-454c-8f7c-9a820de03641">
                                <stop stopColor="#7775D6" />
                                <stop offset={1} stopColor="#E935C1" />
                            </radialGradient>
                        </defs>
                    </svg>
 

                    <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left p-6">
                        <video
                            autoPlay
                            muted
                            loop
                            className="w-full h-auto object-cover rounded-xl"
                        >
                            <source src="https://res.cloudinary.com/dez41esfq/video/upload/v1754454984/cta_3_xedx73.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>

                    <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left p-6">
                        <video
                            autoPlay
                            muted
                            loop
                            className="w-full h-auto object-cover rounded-xl"
                        >
                            <source src="https://res.cloudinary.com/dez41esfq/video/upload/v1754454984/cta_2_xwm21p.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>


                    <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left p-6">
                        <video
                            autoPlay
                            muted
                            loop
                            className="w-full h-auto object-cover rounded-xl"
                        >
                            <source src="https://res.cloudinary.com/dez41esfq/video/upload/v1754454983/cta_1_fgalvc.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
 

                        {/* <div className="relative mt-16 h-[500px] lg:mt-8">
                        <video
                            autoPlay
                            muted
                            loop
                            className="w-full h-auto object-cover rounded-xl"
                        >
                            <source src="/videos/cta_1.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>

                    <div className="relative mt-16 h-[500px] lg:mt-8">
                        <video
                            autoPlay
                            muted
                            loop
                            className="w-full h-auto object-cover rounded-xl"
                        >
                            <source src="/videos/cta_2.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>

                    <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
                        <video
                            autoPlay
                            muted
                            loop
                            className="w-full h-auto object-cover rounded-xxl"
                        >
                            <source src="/videos/cta_3.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div> */}

                    


                </div>
            </div>
        </div>
    )
}


export default Cta_video;
