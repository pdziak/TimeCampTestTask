interface InfoMessageProps {
  message: string
}

export function InfoMessage({ message }: InfoMessageProps) {
  return (
    <div className="info-message">
      {message}
    </div>
  )
}

