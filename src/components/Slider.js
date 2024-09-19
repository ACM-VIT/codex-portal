// components/Slider.js
import Slider from 'react-slick';

export default function SidewaysNavigation() {
  const questions = [
    'Question 1',
    'Question 2',
    'Question 3',
    // Add more questions here
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    swipeToSlide: true,
  };

  return (
    <Slider {...settings}>
      {questions.map((question, index) => (
        <div key={index} className="question-slide">
          <h2>{question}</h2>
          {/* Add answer input box or other question-related content */}
        </div>
      ))}
    </Slider>
  );
}
