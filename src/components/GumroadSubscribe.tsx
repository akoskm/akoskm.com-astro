export function GumroadSubscribe() {
  return (
    <div className="flex flex-col gap-2 pt-8">
      <div className="flex justify-between">
        <p>
          <span className="font-bold">Stay in the loop</span> with future
          updates, blog posts, promotions:
        </p>
      </div>
      <form
        action="https://app.gumroad.com/follow_from_embed_form"
        method="post"
        id="gumroad-follow-form-embed"
        className="flex items-center"
      >
        <input type="hidden" name="seller_id" value="8676566176379" />
        <input
          id="gumroad-follow-form-embed-input"
          type="email"
          placeholder="Your email address"
          name="email"
          className="flex-1 rounded border border-skin-fill/40 bg-skin-fill py-3 pl-10 pr-3 placeholder:italic focus:border-skin-accent focus:outline-none"
        />
        <button
          className="button primary delay-50 ml-4 rounded border bg-orange-600 p-3 transition duration-300 ease-in-out hover:scale-110 hover:bg-indigo-600 hover:shadow-lg"
          type="submit"
          id="gumroad-follow-form-embed-button"
        >
          Follow
        </button>
      </form>
    </div>
  );
}
