/** Logo + bird are PNG masks (tinted with currentColor) — see .logo / .bird in tailwind.css */
export const Logo = (props) => <span className="logo" role="img" aria-label="Freedom Living" {...props} />
export const Bird = (props) => <span className="bird" aria-hidden="true" {...props} />

export const Kicker = ({ children, className = '' }) => (
  <div className={`kicker ${className}`}>
    <span>{children}</span>
  </div>
)

export const Dash = () => <span className="dash" />