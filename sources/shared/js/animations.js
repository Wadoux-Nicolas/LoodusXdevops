export const errorAnimation = {
    keyframes: [
        {transform: 'translateX(0)', easing: 'ease-in'},
        {transform: 'translateX(-5px)', easing: 'ease-out'},
        {transform: 'translateX(5px)', easing: 'ease-in'},
        {transform: 'translateX(0)', easing: 'ease-out'},
    ],
    options: {
        duration: 500,
        iterations: 1
    }
}