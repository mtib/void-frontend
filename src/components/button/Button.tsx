import styled from "styled-components";
import Color from "color";

const Button = styled.button`
    border-radius: 8px;
    border: 1px solid ${props => Color(props.theme.bg).lighten(2).hex()};
    padding: 0.6em 1.2em;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    background-color: ${props => props.theme.bg};
    cursor: pointer;
    transition: border-color 0.25s;
    transition: background-color 0.25s;

    &:hover {
        border-color: ${props => props.theme.fg};
    };

    &:focus,
    &:focus-visible {
        outline: 2px solid ${props => props.theme.fg};
    };`;

export default Button;
