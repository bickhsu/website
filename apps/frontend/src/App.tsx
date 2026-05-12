import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'


function CounterButton({
  name,
  count,
  onIncrement,
  isLoading
}: {
  name: string,
  count: number,
  onIncrement: () => void,
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <button
        type="button"
        className="counter"
        disabled={true}
      >
        Loading ...
      </button>
    )
  }

  return (
    <button
      type="button"
      className="counter"
      onClick={onIncrement}
    >
      {name} is {count}
    </button>
  )
}


function App() {
  const [fruits, setFruits] = useState([
    { id: 1, name: "Apple", count: 0 },
    { id: 2, name: "Banana", count: 0 },
    { id: 3, name: "Orange", count: 0 },
    { id: 4, name: "Strawberry", count: 0 },
    { id: 5, name: "Mango", count: 0 },
    { id: 6, name: "Grapes", count: 0 },
    { id: 7, name: "Pineapple", count: 0 },
    { id: 8, name: "Watermelon", count: 0 },
    { id: 9, name: "Cherry", count: 0 },
    { id: 10, name: "Blueberry", count: 0 },
    { id: 11, name: "Raspberry", count: 0 },
    { id: 12, name: "Blackberry", count: 0 },
    { id: 13, name: "Cranberry", count: 0 },
    { id: 14, name: "Lemon", count: 0 },
    { id: 15, name: "Lime", count: 0 },
    { id: 16, name: "Grapefruit", count: 0 },
    { id: 17, name: "Peach", count: 0 },
    { id: 18, name: "Pear", count: 0 },
    { id: 19, name: "Plum", count: 0 },
    { id: 20, name: "Kiwi", count: 0 },
  ])
  const [isLoading, setIsLoading] = useState(true)

  const onIncrement = (id: number) => {
    setFruits(fruits.map(fruit => fruit.id === id ? { ...fruit, count: fruit.count + 1 } : fruit))
  }

  useEffect(() => {
    const init = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsLoading(false)
    }
    init()
  }, [])

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        {fruits.map(fruit => (
          <CounterButton
            key={fruit.id}
            name={fruit.name}
            count={fruit.count}
            onIncrement={() => onIncrement(fruit.id)}
            isLoading={isLoading} />
        ))}
        <div>Total Fruit: {fruits.reduce((acc, fruit) => acc + fruit.count, 0)}</div>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
