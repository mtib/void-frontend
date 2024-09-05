import styled, { ThemeProvider } from "styled-components";
import { FC, PropsWithChildren } from "react";
import { useVoidBackgroundColor, useVoidPrimaryColor } from "../context/VoidContext";

export const ThemedButton = styled.button`
    border-radius: 8px;
    border: 1px solid transparent;
    padding: 0.6em 1.2em;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    background-color: #1a101a;
    cursor: pointer;
    transition: border-color 0.25s;
    &:hover {
        border-color: ${props => props.theme.fg};
    }`;

export const VoidStyledButton: FC<PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>> = (props) => {
    return <ThemedButton {...props} />;
};

export const VoidThemeProvider: FC<PropsWithChildren> = ({ children }) => {
    const primaryColor = useVoidPrimaryColor();
    const backgroundColor = useVoidBackgroundColor();
    return <ThemeProvider theme={{ bg: backgroundColor, fg: primaryColor }}>{children}</ThemeProvider>;
};
