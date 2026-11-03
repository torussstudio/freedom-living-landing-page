/** Logo + bird are PNG masks (tinted with currentColor) — see .logo / .bird in global.css */
export const Logo = (props) => <span className="logo" role="img" aria-label="Freedom Living" {...props} />
export const Bird = (props) => <span className="bird" aria-hidden="true" {...props} />

export const Kicker = ({ count, children, className = '', style }) => (
  <div className={`kicker ${className}`} style={style}>
    <span className="count">{count}</span><span>{children}</span>
  </div>
)

export const Dash = () => <span className="dash" />
