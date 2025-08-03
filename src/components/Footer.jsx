

export const Footer = () => {
  return (
    <footer className="footer bg-gray-850 flex items-center justify-around max-md:flex-col max-md:items-start bg-base-200 text-base-content p-10">
      <nav>
        <h4 className="footer-title">Services</h4>
        <a className="link link-hover">Branding</a>
        <a className="link link-hover">Design</a>
        <a className="link link-hover">Marketing</a>
        <a className="link link-hover">Advertisement</a>
      </nav>
      <nav>
        <h4 className="footer-title">Company</h4>
        <a className="link link-hover">About us</a>
        <a className="link link-hover">Contact</a>
        <a className="link link-hover">Jobs</a>
        <a className="link link-hover">Press kit</a>
      </nav>
      <nav>
        <h4 className="footer-title">Legal</h4>
        <a className="link link-hover">Terms of use</a>
        <a className="link link-hover">Privacy policy</a>
        <a className="link link-hover">Cookie policy</a>
      </nav>
      <form>
        <h4 className="footer-title">Newsletter</h4>
        <fieldset className="form-control w-80">
          <label className="label">
            <span className="label-text mb-2">Enter your email address</span>
          </label>
          <div className="join">
            <input
              type="text"
              placeholder="username@site.com"
              className="input input-bordered join-item max-md:w-[100px]"
            />
            <button className="btn btn-warning font-bold join-item">Subscribe</button>
          </div>
        </fieldset>
      </form>
    </footer>
  )
}
