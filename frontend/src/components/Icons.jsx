import React from 'react'

export const CopyIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
)

export const CheckIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
)

export const LoadingIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="20" viewBox="0 0 40 20" {...props}>
    <circle cx="10" cy="10" r="3" fill="currentColor">
      <animate attributeName="opacity" from="0.2" to="1" dur="0.8s" begin="0s" repeatCount="indefinite" />
    </circle>
    <circle cx="20" cy="10" r="3" fill="currentColor">
      <animate attributeName="opacity" from="0.2" to="1" dur="0.8s" begin="0.2s" repeatCount="indefinite" />
    </circle>
    <circle cx="30" cy="10" r="3" fill="currentColor">
      <animate attributeName="opacity" from="0.2" to="1" dur="0.8s" begin="0.4s" repeatCount="indefinite" />
    </circle>
  </svg>
)

export const SendIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
)