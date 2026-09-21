import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { ArrowDownRight, ArrowUpRight, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { products, storyFrames } from './data/products'

gsap.registerPlugin(ScrollTrigger)

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

function MagneticButton({ children, className = '', onClick }) {
  const button = useRef(null)
  const move = (e) => {
    if (!button.current || window.matchMedia('(pointer: coarse)').matches) return
    const box = button.current.getBoundingClientRect()
    gsap.to(button.current, { x: (e.clientX - box.left - box.width / 2) * .18, y: (e.clientY - box.top - box.height / 2) * .25, duration: .35, ease: 'power3.out' })
  }
  const leave = () => gsap.to(button.current, { x: 0, y: 0, duration: .55, ease: 'elastic.out(1, .35)' })
  return <button ref={button} onMouseMove={move} onMouseLeave={leave} onClick={onClick} className={`magnetic ${className}`}>{children}</button>
}

function App() {
  const root = useRef(null)
  const cursor = useRef(null)
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  useEffect(() => {
    const lenis = new Lenis({ lerp: .08, smoothWheel: true })
    const frame = (time) => { lenis.raf(time); requestAnimationFrame(frame) }
    requestAnimationFrame(frame)
    const ctx = gsap.context(() => {
      gsap.from('.reveal', { yPercent: 110, opacity: 0, duration: 1.15, stagger: .12, ease: 'power4.out', delay: .2 })
      gsap.utils.toArray('.parallax-image').forEach((image) => gsap.to(image, { yPercent: -12, ease: 'none', scrollTrigger: { trigger: image.parentElement, scrub: true } }))
      gsap.utils.toArray('.product-card').forEach((card) => gsap.from(card, { y: 80, opacity: 0, duration: .85, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 87%' } }))
      gsap.to('.statement-inner', { xPercent: -48, ease: 'none', scrollTrigger: { trigger: '.statement', start: 'top bottom', end: 'bottom top', scrub: true } })
    }, root)
    const cursorMove = (e) => { if (cursor.current) gsap.to(cursor.current, { x: e.clientX, y: e.clientY, duration: .16, ease: 'power2.out' }) }
    window.addEventListener('mousemove', cursorMove)
    return () => { ctx.revert(); lenis.destroy(); window.removeEventListener('mousemove', cursorMove) }
  }, [])

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id)
      return existing ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...product, quantity: 1 }]
    })
    setCartOpen(true)
  }
  const updateQty = (id, delta) => setCart((current) => current.flatMap((item) => item.id === id ? (item.quantity + delta > 0 ? [{ ...item, quantity: item.quantity + delta }] : []) : [item]))
  const subscribe = (e) => { e.preventDefault(); if (email) { setSent(true); setEmail('') } }

  return <main ref={root}>
    <div className="cursor" ref={cursor}><span /></div>
    <nav className="nav"><a className="wordmark" href="#top">TREX</a><div className="nav-links"><a href="#collection">Collection</a><a href="#journal">Journal</a></div><button className="bag-button" onClick={() => setCartOpen(true)} aria-label="Open cart"><ShoppingBag size={18} /><sup>{cart.reduce((n, i) => n + i.quantity, 0)}</sup></button></nav>

    <section className="hero" id="top">
      <div className="hero-grain" />
      <div className="hero-copy"><p className="eyebrow reveal">Performance studies / 001</p><h1><span className="reveal">MAKE</span><span className="reveal outline">GROUND</span><span className="reveal">MOVE.</span></h1><div className="hero-bottom reveal"><p>Form follows force. A new system for the places your day takes you.</p><a href="#collection" className="text-link">Explore the system <ArrowDownRight size={17}/></a></div></div>
      <div className="hero-ad">
        <div className="hero-ad-image"><img src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1500&q=90" alt="TREX Flux 01 running shoe" /></div>
        <div className="hero-ad-meta"><span>Flux 01 / Obsidian Ice</span><span>Responsive road system</span></div>
      </div><p className="hero-index">01 — 04</p>
    </section>

    <section className="intro section-pad"><p className="eyebrow">Designed in motion</p><h2>Not made for a moment.<br />Made for <em>every</em> movement.</h2><div className="intro-copy"><p>Built between the city grid and the open road, TREX studies the physical language of motion—then pares it back to what matters.</p><a href="#journal" className="round-arrow"><ArrowDownRight /></a></div></section>

    <section className="feature-image"><img className="parallax-image" src={storyFrames[0]} alt="Athlete training outdoors" /><div className="feature-caption"><span>01 / Soft architecture</span><span>Move without permission</span></div></section>

    <section className="statement"><div className="statement-inner">BUILT TO <em>REPEAT</em> / BUILT TO <em>REPEAT</em> / </div></section>

    <section className="collection section-pad" id="collection"><div className="section-head"><div><p className="eyebrow">The current rotation</p><h2>Objects of<br /><em>momentum.</em></h2></div><a href="#all" className="text-link">View all footwear <ArrowUpRight size={17}/></a></div><div className="product-grid">{products.map((product, index) => <article className="product-card" key={product.id}><div className="product-image"><span>0{index + 1}</span><img src={product.image} alt={product.name} /><MagneticButton onClick={() => addToCart(product)} className="add-button">Add <Plus size={16}/></MagneticButton></div><div className="product-meta"><div><h3>{product.name}</h3><p>{product.category}</p></div><strong>{money.format(product.price)}</strong></div></article>)}</div></section>

    <section className="manifesto"><div className="manifesto-copy"><p className="eyebrow">TREX philosophy</p><h2>Less noise.<br />More <em>signal.</em></h2><p>Essential geometry, exact cushioning, and engineered restraint. The distance between who you are and where you are going should feel almost invisible.</p><MagneticButton className="cta">Read our principles <ArrowUpRight size={16}/></MagneticButton></div><div className="manifesto-image"><img className="parallax-image" src={storyFrames[1]} alt="Runner in motion" /></div></section>

    <section className="newsletter" id="journal"><p className="eyebrow">Field notes / no. 001</p><h2>Movement,<br /><em>in your inbox.</em></h2><form onSubmit={subscribe}><input aria-label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="YOUR EMAIL ADDRESS" required /><button aria-label="Subscribe"><ArrowUpRight /></button></form>{sent && <p className="sent">You're on the list.</p>}</section>

    <footer><a className="wordmark" href="#top">TREX</a><p>© 2026 TREX STUDIOS. An original concept storefront.</p><div><a href="#instagram">Instagram</a><a href="#terms">Terms</a></div></footer>

    <aside className={`cart ${cartOpen ? 'is-open' : ''}`} aria-hidden={!cartOpen}><div className="cart-top"><h2>Your rotation <sup>({cart.reduce((n, i) => n + i.quantity, 0)})</sup></h2><button onClick={() => setCartOpen(false)} aria-label="Close cart"><X /></button></div>{cart.length === 0 ? <div className="empty-cart"><p>Your bag is waiting for its first move.</p><button onClick={() => setCartOpen(false)} className="text-link">Keep exploring <ArrowDownRight size={17}/></button></div> : <><div className="cart-items">{cart.map((item) => <div className="cart-item" key={item.id}><img src={item.image} alt="" /><div><h3>{item.name}</h3><p>{money.format(item.price)}</p><div className="quantity"><button onClick={() => updateQty(item.id, -1)}><Minus size={13}/></button><span>{item.quantity}</span><button onClick={() => updateQty(item.id, 1)}><Plus size={13}/></button></div></div></div>)}</div><div className="cart-checkout"><div><span>Subtotal</span><strong>{money.format(subtotal)}</strong></div><button className="checkout">Checkout <ArrowUpRight size={16}/></button><p>Taxes and shipping calculated at checkout.</p></div></>}</aside><div className={`scrim ${cartOpen ? 'is-open' : ''}`} onClick={() => setCartOpen(false)} />
  </main>
}

export default App
