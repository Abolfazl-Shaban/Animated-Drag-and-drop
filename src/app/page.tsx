import Link from "next/link";
import AnimatedDragDrop from "./components/AnimatedDragDrop";

export default function Home() {
  return (
    <div>
      <AnimatedDragDrop />
      <div>
        <p className="text-gray-400 absolute bottom-6 left-8 w-96">
          Made with ❤️ - by Abolfazl-Shaban
        </p>
        <div className="absolute text-gray-600 bottom-6 right-6">
          <Link
            href="https://github.com/Abolfazl-Shaban"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline " 
          >
            GitHub
          </Link>
          <span className="mx-2">|</span>
          <Link
            href="https://www.linkedin.com/in/abolfazlshaban/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            LinkedIn
          </Link>
        </div>
      </div>
    </div>
  );
}
