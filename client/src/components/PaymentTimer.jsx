import { useEffect, useState } from "react";

export default function PaymentTimer({ onExpire }) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes = 300 sec

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="alert alert-danger text-center fw-bold">
      Payment session ends in: {minutes}:
      {seconds < 10 ? `0${seconds}` : seconds}
    </div>
  );
}
