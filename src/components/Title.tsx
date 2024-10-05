import {FC, ReactElement} from "react";

interface TitleProps {
    children: ReactElement | string
    navigateHome: () => void
}

export const Title: FC<TitleProps> = props => {
    return (
    <div onClick={props.navigateHome} className="title">
        {props.children}
    </div>
    )
}
