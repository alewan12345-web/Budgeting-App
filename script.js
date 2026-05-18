const tradeInput = document.getElementById("tradeValue");
const tradeLabel = document.getElementById("tradeLabel");
const resultPrice = document.getElementById("resultPrice");

if (tradeInput && tradeLabel && resultPrice) {
  const updateCalculator = () => {
    const tradeValue = Number(tradeInput.value);
    const basePrice = 70;
    const finalPrice = Math.max(0, basePrice - tradeValue);

    tradeLabel.textContent = `$${tradeValue}`;
    resultPrice.textContent = `$${finalPrice}`;
  };

  tradeInput.addEventListener("input", updateCalculator);
  updateCalculator();
}

const reveals = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && reveals.length > 0) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2
    }
  );

  reveals.forEach((item) => observer.observe(item));
} else {
  reveals.forEach((item) => item.classList.add("visible"));
}
