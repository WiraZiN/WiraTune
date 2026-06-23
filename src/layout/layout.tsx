import { useState } from "react";
import Dashboard from "../components/Dashboard/Dashboard";
import Header from "../components/Header/Header";
import Reproduccion from "../components/Reproduccion/Reproduccion";
import SidebarDerecho from "../components/SidebarDerecho/SidebarDerecho";
import SidebarIzquierdo from "../components/SidebarIzquierdo/SidebarIzquierdo";
import { ItemBiblioteca } from "../interfaces/itemBiblioteca";

export function Layout() {
    const [activeTrack, setActiveTrack] = useState<ItemBiblioteca | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <div className="main">
            <div className="head">
                <Header />
            </div>
            <div className="body">
                <div className="list">
                    <SidebarIzquierdo
                        activeTrack={activeTrack}
                        setActiveTrack={setActiveTrack}
                        isPlaying={isPlaying}
                        setIsPlaying={setIsPlaying}
                    />
                </div>
                <div className="dashboard">
                    <Dashboard
                        activeTrack={activeTrack}
                        isPlaying={isPlaying}
                        setIsPlaying={setIsPlaying}
                        setActiveTrack={setActiveTrack}
                    />
                </div>
                <div className="list-right">
                    <SidebarDerecho />
                </div>

            </div>
            <div className="reproduction">
                <Reproduccion
                    activeTrack={activeTrack}
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                />
            </div>
        </div>
    )
}
