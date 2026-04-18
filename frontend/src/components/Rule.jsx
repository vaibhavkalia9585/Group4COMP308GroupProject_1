export default function Rule({ thick = false, className = '' }) {
  return <hr className={`${thick ? 'hr-thick' : 'hr-thin'} ${className}`} />;
}
