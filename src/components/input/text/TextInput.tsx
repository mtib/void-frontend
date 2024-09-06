import Color from "color";
import styled from "styled-components";

const TextInput = styled.input`
    flex-grow: 1;
    background-color: ${props => props.theme.bg};
    border: 1px solid ${props => Color(props.theme.bg).lighten(2).hex()};
    padding: 10px;
    border-radius: 10px;
    border-width: 1px;
    border-style: solid;
    font-family: monospace;
    min-width: 50px;

    &:focus,
    &:focus-visible {
        outline: 2px solid ${props => props.theme.fg};
    };`;

export default TextInput;
