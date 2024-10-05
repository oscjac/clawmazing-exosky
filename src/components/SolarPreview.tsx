import { Exoplanet } from "@/include/data";
import '../App.css'
import { FC } from "react";

type SolarPreviewComponents = {
    host: string
    planets: Exoplanet[] 
    setSystem: (name: string) => void
}

export const SolarPreview: FC<SolarPreviewComponents>  = props => {

    const handleClick = () => {
        props.setSystem(props.host)
    }

    return <div className="solar-element" onClick={handleClick}>
        {props.host}
    </div>
}