import testimonials from "../data/testimonials.json";

interface TestimonialProps {
  content: string;
  author: string;
  link: string;
  image: string;
  title: string;
}

function Testimonial({
  content,
  author,
  link,
  image,
  title,
}: TestimonialProps) {
  return (
    <div className="flex max-w-xl flex-col items-center space-y-6 rounded rounded-lg border border-skin-fill/40 bg-skin-fill p-2 shadow-lg">
      <div className="relative">
        <img
          src={`/assets/${image}`}
          alt="Testimonial author"
          className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-md"
        />
      </div>
      <div className="flex flex-col items-center">
        <a className="underline" href={link}>
          {author}
        </a>
        <div className="text-gray-500">{title}</div>
      </div>
      <blockquote className="whitespace-pre-line text-center text-lg italic">
        "{content}"
      </blockquote>
    </div>
  );
}

function TestimonialsRow() {
  return (
    <div className="md:grid-cols-2 grid grid-cols-2 gap-6">
      {testimonials.map((testimonial, index) => (
        <Testimonial key={index} {...testimonial} />
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <>
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-bold">Testimonials</h2>
        <p className="text-lg text-gray-300">What my readers are saying</p>
      </div>
      <TestimonialsRow />
    </>
  );
}
