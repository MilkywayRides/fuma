import React from 'react'

export const BookIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-black dark:text-white" role="img" {...props}>
      <path opacity="0.4" d="M20.5 16.9286V10C20.5 6.22876 20.5 4.34315 19.3284 3.17157C18.1569 2 16.2712 2 12.5 2H11.5C7.72876 2 5.84315 2 4.67157 3.17157C3.5 4.34315 3.5 6.22876 3.5 10V14C3.5 17.7712 3.5 19.6569 4.67157 20.8284C5.84315 22 7.72876 22 11.5 22H12.5C16.2712 22 18.1569 22 19.3284 20.8284C19.8628 20.2941 20.1823 19.6244 20.3648 18.7143" fill="currentColor"/>
      <path d="M20.5 16.9286C18.5 17.5 16.5 18 12 18C7.5 18 5.5 17.5 3.5 16.9286V14C5.5 14.5 7.5 15 12 15C16.5 15 18.5 14.5 20.5 14V16.9286Z" fill="currentColor"/>
      <path d="M20.5 10C18.5 10.5 16.5 11 12 11C7.5 11 5.5 10.5 3.5 10V7C5.5 7.5 7.5 8 12 8C16.5 8 18.5 7.5 20.5 7V10Z" fill="currentColor"/>
    </svg>
  )
}
