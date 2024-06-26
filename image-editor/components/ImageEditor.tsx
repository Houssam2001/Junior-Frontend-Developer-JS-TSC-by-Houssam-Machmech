'use client'
import { useState, useRef, useEffect } from 'react';

const ImageEditor = () => {
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [history, setHistory] = useState<ImageData[]>([]);
    const [currentStep, setCurrentStep] = useState<number>(-1);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const brightnessRef = useRef<HTMLInputElement>(null);
    const contrastRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (image && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                canvasRef.current.width = image.width;
                canvasRef.current.height = image.height;
                ctx.drawImage(image, 0, 0);
                saveState();
            }
        }
    }, [image]);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target?.result as string;
                img.onload = () => setImage(img);
            };
            reader.readAsDataURL(file);
        }
    };

    const applyFilter = (filter: string) => {
        if (canvasRef.current && image) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                ctx.filter = filter;
                ctx.drawImage(image, 0, 0);
                saveState();
            }
        }
    };

    const adjustImage = () => {
        if (canvasRef.current && image) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx && brightnessRef.current && contrastRef.current) {
                const brightness = brightnessRef.current.value;
                const contrast = contrastRef.current.value;
                ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
                ctx.drawImage(image, 0, 0);
                saveState();
            }
        }
    };

    const saveState = () => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                const newHistory = history.slice(0, currentStep + 1);
                newHistory.push(ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));
                setHistory(newHistory);
                setCurrentStep(newHistory.length - 1);
            }
        }
    };

    const undo = () => {
        if (currentStep > 0) {
            const prevStep = currentStep - 1;
            setCurrentStep(prevStep);
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) {
                ctx.putImageData(history[prevStep], 0, 0);
            }
        }
    };

    const redo = () => {
        if (currentStep < history.length - 1) {
            const nextStep = currentStep + 1;
            setCurrentStep(nextStep);
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) {
                ctx.putImageData(history[nextStep], 0, 0);
            }
        }
    };

    const saveImage = () => {
        if (canvasRef.current) {
            const link = document.createElement('a');
            link.download = 'edited-image.png';
            link.href = canvasRef.current.toDataURL();
            link.click();
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 text-center">Image Editor</h1>
            <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="block mx-auto mb-4"
            />
            <canvas ref={canvasRef} className="block mx-auto border rounded mb-4"></canvas>

            <div className="flex flex-col items-center space-y-4">
                <h2 className="text-xl font-semibold">Filters</h2>
                <div className="flex space-x-2">
                    <button 
                        onClick={() => applyFilter('grayscale(100%)')} 
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Grayscale
                    </button>
                    <button 
                        onClick={() => applyFilter('sepia(100%)')} 
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Sepia
                    </button>
                    <button 
                        onClick={() => applyFilter('blur(5px)')} 
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Blur
                    </button>
                </div>

                <h2 className="text-xl font-semibold">Adjustments</h2>
                <div className="flex flex-col space-y-2 items-center">
                    <label className="flex flex-col items-center">
                        Brightness
                        <input 
                            ref={brightnessRef}
                            type="range" 
                            min="0" 
                            max="200" 
                            defaultValue="100" 
                            onChange={adjustImage}
                            className="w-full"
                        />
                    </label>
                    <label className="flex flex-col items-center">
                        Contrast
                        <input 
                            ref={contrastRef}
                            type="range" 
                            min="0" 
                            max="200" 
                            defaultValue="100" 
                            onChange={adjustImage}
                            className="w-full"
                        />
                    </label>
                </div>

                <h2 className="text-xl font-semibold">History</h2>
                <div className="flex space-x-2">
                    <button 
                        onClick={undo} 
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Undo
                    </button>
                    <button 
                        onClick={redo} 
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Redo
                    </button>
                </div>

                <h2 className="text-xl font-semibold">Save</h2>
                <button 
                    onClick={saveImage} 
                    className="bg-green-500 text-white px-4 py-2 rounded"
                >
                    Save Image
                </button>
            </div>
        </div>
    );
};

export default ImageEditor;

