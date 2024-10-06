import { ExoplanetDetail } from "@/include/data";
import '../App.css'
import { FC } from "react";
import { Howl } from "howler";

type SolarPreviewComponents = {
    host: string
    planets: ExoplanetDetail[] 
    setSystem: (name: string) => void
}

const clickSound = new Howl({
    src: ['/selection.mp3'],
  });

export const SolarPreview: FC<SolarPreviewComponents>  = props => {

    const handleClick = () => {
        clickSound.play()
        props.setSystem(props.host)
    }

    return <div className="solar-element" onClick={handleClick}>
        {props.host}
    </div>
}