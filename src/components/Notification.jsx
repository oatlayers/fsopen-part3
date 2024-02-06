const Notification = ({message}) => {
    if (message === null) {
        return null
    } else if (message.includes('Information')) {
        return (
            <div className='error'>
                {message}
            </div>
        )
    } else if (message.includes('shorter')) {
        return (
            <div className='error'>
                {message}
            </div>
        )
    } else if (message.includes('valid')) {
        return (
            <div className='error'>
                {message}
            </div>
        )
    }
    return (
        <div className='success'>
            {message}
        </div>
    )
}

export default Notification