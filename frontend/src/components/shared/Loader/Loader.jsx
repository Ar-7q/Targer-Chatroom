import React from 'react';
// added in part-5
const Loader = ({ message }) => {

    return (
        <div className="flex items-center justify-center min-h-screen bg-black">

            {/* Glass Card */}
            <div className="flex flex-col items-center gap-6 p-8 rounded-2xl 
                      backdrop-blur-md bg-white/5 border border-white/10 
                      shadow-lg shadow-indigo-500/10">

                {/* Spinner */}
                <div className="relative">
                    {/* Base circle */}
                    <div className="w-14 h-14 rounded-full border-2 border-gray-700"></div>

                    {/* Animated arc */}
                    <div className="absolute inset-0 w-14 h-14 rounded-full 
                          border-2 border-t-indigo-500 border-r-transparent 
                          border-b-transparent border-l-transparent 
                          animate-spin">
                    </div>

                    {/* Glow effect */}
                    <div className="absolute inset-0 w-14 h-14 rounded-full 
                          blur-md bg-indigo-500/20"></div>
                </div>

                {/* Text */}
                <p className="text-sm text-gray-400 tracking-wide animate-pulse">
                    {message}
                </p>

            </div>
        </div>
    );
};

export default Loader;