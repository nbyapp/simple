import { createGlobalStyle } from 'styled-components'
import { Theme } from './theme'

export const GlobalStyles = createGlobalStyle<{ theme: Theme }>`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    height: 100%;
    width: 100%;
  }

  body {
    font-family: ${({ theme }) => theme.typography.fontFamily};
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    height: 100%;
    width: 100%;
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
    font-family: ${({ theme }) => theme.typography.fontFamily};
    font-size: ${({ theme }) => theme.typography.body.regular.fontSize};
  }

  /* Remove autofill background color */
  input:-webkit-autofill,
  input:-webkit-autofill:hover, 
  input:-webkit-autofill:focus, 
  input:-webkit-autofill:active {
    transition: background-color 5000s ease-in-out 0s;
  }
`
