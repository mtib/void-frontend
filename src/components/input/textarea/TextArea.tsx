import Color from "color";
import styled from "styled-components";

const TextArea = styled.textarea`
    background-color: ${(props) => props.theme.bg};
    border: 1px solid ${props => Color(props.theme.bg).lighten(2).hex()};
    border-radius: 10px;
    padding: 10px;
    font-family: monospace;
    font-size: 16px;
    flex-grow: 1;

    &:focus,
    &:focus-visible {
        outline: 2px solid ${(props) => props.theme.fg};
    };
`;

export default TextArea;
