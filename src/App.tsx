import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react"

type Page = "home" | "rooms" | "room" | "login" | "register" | "booking" | "payment" | "processing" | "success" | "failure" | "bookings" | "booking-detail" | "profile" | "review" | "about" | "contact" | "admin-login" | "admin" | "admin-rooms" | "admin-types" | "admin-bookings" | "admin-customers" | "reports"

type Room = {
  name: string
  number: string
  price: number
  image: string
  type: string
  capacity: number
  status: string
}
type Toast = { text: string; tone?: "success" | "error" }
type SearchCriteria = {
  checkIn: string
  checkOut: string
  guests: number
  roomType: string
}

const A = "/assets"
const rooms: Room[] = [
  {
    name: "Deluxe King",
    number: "204",
    price: 180,
    image: `${A}/75c58.png`,
    type: "DELUXE COLLECTION",
    capacity: 2,
    status: "Available",
  },
  {
    name: "Garden Twin",
    number: "208",
    price: 150,
    image: `${A}/0566d.png`,
    type: "DELUXE COLLECTION",
    capacity: 2,
    status: "Available",
  },
  {
    name: "Corner Suite",
    number: "301",
    price: 260,
    image: `${A}/6c532.png`,
    type: "SUITE",
    capacity: 3,
    status: "Available",
  },
]

const navMap: Record<string, Page> = {
  "/": "home",
  "/rooms": "rooms",
  "/room": "room",
  "/login": "login",
  "/register": "register",
  "/booking": "booking",
  "/payment": "payment",
  "/processing": "processing",
  "/success": "success",
  "/failure": "failure",
  "/bookings": "bookings",
  "/booking-detail": "booking-detail",
  "/profile": "profile",
  "/review": "review",
  "/about": "about",
  "/contact": "contact",
  "/admin-login": "admin-login",
  "/admin": "admin",
  "/admin/rooms": "admin-rooms",
  "/admin/types": "admin-types",
  "/admin/bookings": "admin-bookings",
  "/admin/customers": "admin-customers",
  "/admin/reports": "reports",
}
const pathMap = Object.fromEntries(
  Object.entries(navMap).map(([k, v]) => [v, k]),
) as Record<Page, string>

const addDays = (date: string, days = 1) => {
  const value = new Date(`${date}T00:00:00`)
  value.setDate(value.getDate() + days)
  return value.toISOString().slice(0, 10)
}

export default function App() {
  const initial = navMap[location.hash.slice(1)] || "home"
  const [page, setPage] = useState<Page>(initial)
  const [loggedIn, setLoggedIn] = useState(
    () => localStorage.getItem("aurel-customer-session") === "active",
  )
  const [selectedRoom, setSelectedRoom] = useState(rooms[0])
  const [pendingBooking, setPendingBooking] = useState(false)
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    checkIn: "2026-11-12",
    checkOut: "2026-11-15",
    guests: 2,
    roomType: "All room types",
  })
  const [discount, setDiscount] = useState("")
  const [discountApplied, setDiscountApplied] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [modal, setModal] = useState<ReactNode>(null)

  const go = (next: Page) => {
    location.hash = pathMap[next]
    setPage(next)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  useEffect(() => {
    const onHash = () => setPage(navMap[location.hash.slice(1)] || "home")
    addEventListener("hashchange", onHash)
    return () => removeEventListener("hashchange", onHash)
  }, [])
  useEffect(() => {
    if (loggedIn) {
      localStorage.setItem("aurel-customer-session", "active")
    } else {
      localStorage.removeItem("aurel-customer-session")
    }
  }, [loggedIn])
  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(id)
  }, [toast])

  const common = {
    go,
    loggedIn,
    setLoggedIn,
    selectedRoom,
    setSelectedRoom,
    pendingBooking,
    setPendingBooking,
    searchCriteria,
    setSearchCriteria,
    setToast,
    setModal,
  }
  let content: ReactNode
  if (page === "home") content = <Home {...common} />
  else if (page === "rooms") content = <Rooms {...common} />
  else if (page === "room") content = <RoomDetails {...common} />
  else if (page === "login" || page === "register" || page === "admin-login")
    content = <Auth page={page} {...common} />
  else if (page === "booking")
    content = (
      <Booking
        {...common}
        discount={discount}
        setDiscount={setDiscount}
        applied={discountApplied}
        setApplied={setDiscountApplied}
      />
    )
  else if (page === "payment")
    content = <Payment {...common} applied={discountApplied} />
  else if (page === "processing")
    content = <Outcome kind="processing" {...common} />
  else if (page === "success") content = <Outcome kind="success" {...common} />
  else if (page === "failure") content = <Outcome kind="failure" {...common} />
  else if (page === "bookings") content = <Bookings {...common} />
  else if (page === "booking-detail") content = <BookingDetail {...common} />
  else if (page === "profile") content = <Profile {...common} />
  else if (page === "review") content = <Review {...common} />
  else if (page === "about" || page === "contact")
    content = <InfoPage page={page} {...common} />
  else content = <Admin page={page} {...common} />

  return (
    <>
      {content}
      {toast && (
        <div className={`toast ${toast.tone || "success"}`}>
          {toast.tone === "error" ? "!" : "✓"} {toast.text}
        </div>
      )}
      {modal && (
        <div className="modal-backdrop" onMouseDown={() => setModal(null)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            {modal}
          </div>
        </div>
      )}
    </>
  )
}

type Common = {
  go: (p: Page) => void
  loggedIn: boolean
  setLoggedIn: (v: boolean) => void
  selectedRoom: Room
  setSelectedRoom: (r: Room) => void
  pendingBooking: boolean
  setPendingBooking: (v: boolean) => void
  searchCriteria: SearchCriteria
  setSearchCriteria: (v: SearchCriteria) => void
  setToast: (v: Toast | null) => void
  setModal: (v: ReactNode) => void
}

function Brand({ light = false }: { light?: boolean }) {
  return (
    <button
      className={`brand ${light ? "light" : ""}`}
      onClick={() => (location.hash = "/")}
    >
      <span className="monogram">A</span>
      <span>
        <b>AUREL</b>
        <small>HOUSE & HOTEL</small>
      </span>
    </button>
  )
}

function Header({
  go,
  loggedIn,
  setLoggedIn,
  setPendingBooking,
}: Pick<
  Common,
  "go" | "loggedIn" | "setLoggedIn" | "setPendingBooking"
>) {
  const [open, setOpen] = useState(false)
  return (
    <header>
      <Brand />
      <button
        className="menu"
        aria-label="Toggle navigation"
        onClick={() => setOpen(!open)}
      >
        ☰
      </button>
      <nav className={open ? "open" : ""}>
        <button
          className="rounded-md px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:!bg-[#183153] hover:!text-white hover:shadow-md"
          onClick={() => go("home")}
        >
          Home
        </button>
        <button
          className="rounded-md px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:!bg-[#183153] hover:!text-white hover:shadow-md"
          onClick={() => go("rooms")}
        >
          Rooms
        </button>
        <button
          className="rounded-md px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:!bg-[#183153] hover:!text-white hover:shadow-md"
          onClick={() => go("about")}
        >
          About
        </button>
        <button
          className="rounded-md px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:!bg-[#183153] hover:!text-white hover:shadow-md"
          onClick={() => go("contact")}
        >
          Contact
        </button>
        {loggedIn ? (
          <>
            <button onClick={() => go("bookings")}>My Bookings</button>
            <button className="outline" onClick={() => go("profile")}>
              Alex Morgan
            </button>
            <button
              className="mobile-only danger"
              onClick={() => {
                setLoggedIn(false)
                go("home")
              }}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <button
              className="rounded-md px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:!bg-[#183153] hover:!text-white hover:shadow-md"
              onClick={() => {
                setPendingBooking(false)
                go("login")
              }}
            >
              Login
            </button>
            <button
              className="outline transition-all duration-200 hover:-translate-y-0.5 hover:!border-[#183153] hover:!bg-[#183153] hover:!text-white hover:shadow-md"
              onClick={() => {
                setPendingBooking(false)
                go("register")
              }}
            >
              Register
            </button>
          </>
        )}
      </nav>
    </header>
  )
}

function Footer({ go }: Pick<Common, "go">) {
  return (
    <footer>
      <div>
        <Brand light />
        <p>A considered stay. A little more extraordinary.</p>
        <p>18 Garden Avenue, Brookfield · +1 (555) 010-2040</p>
      </div>
      <div>
        <b>Make yourself at home</b>
        <p>
          <button onClick={() => go("rooms")}>Rooms & rates</button> ·{" "}
          <button onClick={() => go("about")}>About</button> ·{" "}
          <button onClick={() => go("contact")}>Contact</button>
        </p>
        <p>
          <button onClick={() => go("admin-login")}>Staff sign in</button>
        </p>
        <p>Fictional university project · USD · © 2026</p>
      </div>
    </footer>
  )
}

function StayDateFields({
  searchCriteria,
  setSearchCriteria,
}: Pick<Common, "searchCriteria" | "setSearchCriteria">) {
  const updateCheckIn = (checkIn: string) => {
    const earliestCheckOut = addDays(checkIn)
    setSearchCriteria({
      ...searchCriteria,
      checkIn,
      checkOut:
        searchCriteria.checkOut < earliestCheckOut
          ? earliestCheckOut
          : searchCriteria.checkOut,
    })
  }
  return (
    <>
      <Field label="Check-in">
        <input
          type="date"
          value={searchCriteria.checkIn}
          onChange={(e) => updateCheckIn(e.target.value)}
        />
      </Field>
      <Field label="Check-out">
        <input
          type="date"
          min={addDays(searchCriteria.checkIn)}
          value={searchCriteria.checkOut}
          onChange={(e) => {
            const earliestCheckOut = addDays(searchCriteria.checkIn)
            setSearchCriteria({
              ...searchCriteria,
              checkOut:
                e.target.value < earliestCheckOut
                  ? earliestCheckOut
                  : e.target.value,
            })
          }}
        />
      </Field>
    </>
  )
}

function SearchBar({
  go,
  searchCriteria,
  setSearchCriteria,
}: Pick<Common, "go" | "searchCriteria" | "setSearchCriteria">) {
  return (
    <div className="search-bar">
      <StayDateFields
        searchCriteria={searchCriteria}
        setSearchCriteria={setSearchCriteria}
      />
      <Field label="Guests">
        <select
          value={searchCriteria.guests}
          onChange={(e) =>
            setSearchCriteria({
              ...searchCriteria,
              guests: Number(e.target.value),
            })
          }
        >
          <option value="2">2 adults</option>
          <option value="1">1 adult</option>
          <option value="3">3 adults</option>
        </select>
      </Field>
      <Field label="Room type">
        <select
          value={searchCriteria.roomType}
          onChange={(e) =>
            setSearchCriteria({
              ...searchCriteria,
              roomType: e.target.value,
            })
          }
        >
          <option>All room types</option>
          <option>Deluxe King</option>
          <option>Garden Twin</option>
          <option>Corner Suite</option>
        </select>
      </Field>
      <button className="primary" onClick={() => go("rooms")}>
        Search available rooms →
      </button>
    </div>
  )
}

function Home(c: Common) {
  return (
    <>
      <Header {...c} />
      <section className="hero">
        <img src={`${A}/6b457.png`} alt="Aurel House courtyard at night" />
        <div className="hero-copy">
          <Eyebrow>Your city retreat</Eyebrow>
          <h1>
            Stay somewhere
            <br />
            that feels like you.
          </h1>
          <p>
            Thoughtful rooms, genuine hospitality, and a slower kind of city
            stay. Welcome to Aurel House.
          </p>
        </div>
      </section>
      <main>
        <SearchBar {...c} />
        <div className="home-section-heading">
          <Title
            eyebrow="Rest comes easy here."
            title="A good day begins with a great stay."
            sub="Designed for restful nights, unhurried mornings, and everything in between."
          />
          <button className="primary" onClick={() => c.go("rooms")}>
            View all rooms →
          </button>
        </div>
        <div className="room-grid">
          {rooms.map((r) => (
            <RoomCard key={r.name} room={r} {...c} />
          ))}
        </div>
        <section className="feature split">
          <img src={`${A}/490ac.png`} alt="Aurel House lobby" />
          <div>
            <Eyebrow>The Aurel way</Eyebrow>
            <h2>Considered details. Effortless comfort.</h2>
            <p>
              A peaceful corner of Brookfield, with all the little things that
              make a stay feel personal.
            </p>
            {[
              "Always connected",
              "Mornings, made better",
              "Here for you, 24/7",
              "Room to recharge",
            ].map((x) => (
              <p key={x} className="feature-line">
                ◇ <b>{x}</b>
              </p>
            ))}
          </div>
        </section>
        <Title
          eyebrow="Guest notes"
          title="Small moments. Lasting memories."
          sub="Illustrative guest feedback for this university project."
        />
        <div className="review-grid">
          <ReviewQuote text="The room was beautifully quiet, and the team made our anniversary feel special." />
          <ReviewQuote text="Thoughtful design, a brilliant breakfast, and the perfect base for a city weekend." />
        </div>
      </main>
      <Footer go={c.go} />
    </>
  )
}

function RoomCard({
  room,
  go,
  setSelectedRoom,
}: { room: Room } & Pick<Common, "go" | "setSelectedRoom">) {
  return (
    <article className="room-card">
      <img src={room.image} alt={room.name} />
      <div className="card-body">
        <div className="row">
          <Eyebrow>{room.type}</Eyebrow>
          <Badge>Available</Badge>
        </div>
        <h3>{room.name}</h3>
        <p className="stars">
          ★★★★★ <span>4.9 · 128 reviews</span>
        </p>
        <p>
          {room.name === "Corner Suite"
            ? "52 m² · Up to 3 guests · City view"
            : "32 m² · 2 guests · King bed"}
        </p>
        <p>Wi-Fi included · Breakfast available · Free cancellation</p>
        <div className="price-row">
          <strong>
            ${room.price}
            <small>per night · USD</small>
          </strong>
          <button
            className="outline"
            onClick={() => {
              setSelectedRoom(room)
              go("room")
            }}
          >
            View room
          </button>
        </div>
      </div>
    </article>
  )
}

function Rooms(c: Common) {
  const defaultFilters = {
    budget: "100-300",
    roomType: c.searchCriteria.roomType,
    guests: c.searchCriteria.guests,
    amenities: ["Free Wi-Fi", "Free cancellation", "Breakfast included"],
  }
  const [draft, setDraft] = useState(defaultFilters)
  const [applied, setApplied] = useState(defaultFilters)
  const [sort, setSort] = useState("recommended")

  useEffect(() => {
    setDraft((current) => ({
      ...current,
      roomType: c.searchCriteria.roomType,
      guests: c.searchCriteria.guests,
    }))
    setApplied((current) => ({
      ...current,
      roomType: c.searchCriteria.roomType,
      guests: c.searchCriteria.guests,
    }))
  }, [c.searchCriteria.roomType, c.searchCriteria.guests])

  const filterRooms = (
    filters: typeof defaultFilters,
    sortOrder: string,
  ) => {
    const filtered = rooms.filter((room) => {
      const inBudget =
        filters.budget === "all" ||
        (filters.budget === "100-160" && room.price <= 160) ||
        (filters.budget === "161-200" &&
          room.price >= 161 &&
          room.price <= 200) ||
        (filters.budget === "201-300" && room.price >= 201)
      const rightType =
        filters.roomType === "All room types" ||
        room.name === filters.roomType
      const enoughSpace = room.capacity >= filters.guests
      const hasCityView =
        !filters.amenities.includes("City view") ||
        room.name === "Corner Suite"
      const isAccessible =
        !filters.amenities.includes("Accessible room") ||
        room.name === "Garden Twin"
      return (
        inBudget && rightType && enoughSpace && hasCityView && isAccessible
      )
    })
    return [...filtered].sort((a, b) => {
      if (sortOrder === "low") return a.price - b.price
      if (sortOrder === "high") return b.price - a.price
      return rooms.indexOf(a) - rooms.indexOf(b)
    })
  }

  const visibleRooms = useMemo(
    () => filterRooms(applied, sort),
    [applied, sort],
  )
  const toggleAmenity = (amenity: string, checked: boolean) => {
    setDraft({
      ...draft,
      amenities: checked
        ? [...draft.amenities, amenity]
        : draft.amenities.filter((item) => item !== amenity),
    })
  }
  const applyFilters = () => {
    const next = { ...draft, amenities: [...draft.amenities] }
    setApplied(next)
    c.setToast({
      text: `Filters applied. ${filterRooms(next, sort).length} rooms available.`,
    })
  }
  const resetFilters = () => {
    const reset = {
      budget: "100-300",
      roomType: "All room types",
      guests: 2,
      amenities: [
        "Free Wi-Fi",
        "Free cancellation",
        "Breakfast included",
      ],
    }
    setDraft(reset)
    setApplied(reset)
    setSort("recommended")
    c.setSearchCriteria({
      ...c.searchCriteria,
      roomType: "All room types",
      guests: 2,
    })
  }

  return (
    <>
      <Header {...c} />
      <main>
        <Title
          eyebrow="Find your retreat"
          title="Your next good night starts here."
          sub="Nov 12–15, 2026 · 2 adults · Prices in USD, taxes included."
        />
        <SearchBar {...c} />
        <div className="search-layout">
          <aside className="filter card">
            <h3>Refine your stay</h3>
            <Field label="Nightly budget">
              <select
                value={draft.budget}
                onChange={(e) =>
                  setDraft({ ...draft, budget: e.target.value })
                }
              >
                <option value="100-300">$100 – $300</option>
                <option value="100-160">$100 – $160</option>
                <option value="161-200">$161 – $200</option>
                <option value="201-300">$201 – $300</option>
                <option value="all">All prices</option>
              </select>
            </Field>
            <Field label="Room type">
              <select
                value={draft.roomType}
                onChange={(e) =>
                  setDraft({ ...draft, roomType: e.target.value })
                }
              >
                <option>All room types</option>
                <option>Deluxe King</option>
                <option>Garden Twin</option>
                <option>Corner Suite</option>
              </select>
            </Field>
            <Field label="Guests">
              <select
                value={draft.guests}
                onChange={(e) =>
                  setDraft({ ...draft, guests: Number(e.target.value) })
                }
              >
                <option value="1">1 adult</option>
                <option value="2">2 adults</option>
                <option value="3">3 adults</option>
              </select>
            </Field>
            <b className="label">Amenities</b>
            {[
              "Free Wi-Fi",
              "Free cancellation",
              "Breakfast included",
              "City view",
              "Accessible room",
            ].map((x, i) => (
              <label className="check" key={x}>
                <input
                  type="checkbox"
                  checked={draft.amenities.includes(x)}
                  onChange={(e) => toggleAmenity(x, e.target.checked)}
                />{" "}
                {x}
              </label>
            ))}
            <button className="primary" onClick={applyFilters}>
              Apply filters
            </button>
            <button className="link" onClick={resetFilters}>
              Reset all filters
            </button>
          </aside>
          <section className="results">
            <div className="row">
              <div>
                <h2>
                  {visibleRooms.length}{" "}
                  {visibleRooms.length === 1 ? "room" : "rooms"}, just right
                  for you
                </h2>
                <p>
                  {visibleRooms.length
                    ? "All available for your selected dates."
                    : "Try changing or resetting your filters."}
                </p>
              </div>
              <Field label="Sort by">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="recommended">Recommended</option>
                  <option value="low">Price: low to high</option>
                  <option value="high">Price: high to low</option>
                </select>
              </Field>
            </div>
            <div className="room-grid results-grid">
              {visibleRooms.map((r) => (
                <RoomCard key={r.name} room={r} {...c} />
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer go={c.go} />
    </>
  )
}

function RoomDetails(c: Common) {
  const r = c.selectedRoom
  const book = () => {
    if (c.loggedIn) {
      c.go("booking")
      return
    }
    c.setPendingBooking(true)
    c.go("login")
  }
  return (
    <>
      <Header {...c} />
      <main>
        <p className="crumb">Home / Rooms / {r.name}</p>
        <Title
          eyebrow={r.type}
          title={r.name}
          sub={`Your quiet corner of the city. Room ${r.number} · 32 m² · Garden-facing.`}
        />
        <p className="stars">
          ★★★★★ <span>4.9 · 128 guest reviews</span>
        </p>
        <div className="gallery">
          <img src={r.image} alt={r.name} />
          <img src={`${A}/490ac.png`} alt="Lobby" />
          <img src={`${A}/09deb.png`} alt="Breakfast courtyard" />
        </div>
        <div className="detail-layout">
          <div className="details">
            <h2>Rest comes naturally here.</h2>
            <p>
              Warm oak, soft linens, and plenty of natural light. Settle into a
              generous king bed after a day exploring Brookfield, then wake to a
              fresh coffee and a view of our courtyard garden.
            </p>
            <div className="facts">
              <b>King bed</b>
              <b>2 guests max</b>
              <b>32 m²</b>
            </div>
            <hr />
            <h3>Everything you need</h3>
            <div className="amenities">
              {[
                "High-speed Wi-Fi",
                "Coffee & tea",
                "Smart TV",
                "Rain shower",
                "Air conditioning",
                "In-room safe",
              ].map((x) => (
                <span key={x}>◇ {x}</span>
              ))}
            </div>
            <hr />
            <h3>Good to know</h3>
            <p>
              Check-in from 3:00 PM · Check-out by 11:00 AM. Non-smoking room.
              Free cancellation until Nov 10, 2026 at 3:00 PM.
            </p>
            <h3>Guest reviews</h3>
            <ReviewQuote text="Beautiful light, a really comfortable bed, and a wonderfully calm atmosphere. We would happily stay again." />
          </div>
          <aside className="booking-card card">
            <div className="row">
              <b>From / night</b>
              <strong className="price">${r.price}</strong>
            </div>
            <Badge>Available</Badge>
            <StayDateFields
              searchCriteria={c.searchCriteria}
              setSearchCriteria={c.setSearchCriteria}
            />
            <Field label="Guests">
              <select>
                <option>2 adults</option>
              </select>
            </Field>
            <div className="row">
              <span>3 nights · Before discount</span>
              <b>${r.price * 3}.00</b>
            </div>
            <button className="primary" onClick={book}>
              Book now →
            </button>
            <small>
              {c.loggedIn
                ? "Your room will be held through checkout."
                : "Sign in to reserve. You won’t be charged yet."}
            </small>
          </aside>
        </div>
      </main>
      <SimpleFooter />
    </>
  )
}

function Auth({
  page,
  ...c
}: Common & { page: "login" | "register" | "admin-login" }) {
  const register = page === "register",
    admin = page === "admin-login"
  const submit = (e: FormEvent) => {
    e.preventDefault()
    c.setLoggedIn(true)
    c.setToast({
      text: admin
        ? "Administrator access granted."
        : register
          ? "Account created. Welcome to Aurel House."
          : "Welcome back, Alex.",
    })
    const destination = admin ? "admin" : c.pendingBooking ? "booking" : "home"
    c.setPendingBooking(false)
    c.go(destination)
  }
  return (
    <>
      <Header {...c} />
      <main className="auth">
        <div className="auth-image">
          <img
            src={`${A}/${admin ? "490ac" : "6b457"}.png`}
            alt="Aurel House"
          />
          <h2>
            {admin
              ? "Thoughtful hospitality starts with you."
              : "A little escape. A warm welcome."}
          </h2>
          <p>Your next chapter at Aurel House.</p>
        </div>
        <div className="auth-form">
          <Title
            eyebrow={admin ? "Aurel management" : "Your Aurel account"}
            title={
              register
                ? "Make yourself at home."
                : admin
                  ? "Welcome, team."
                  : "Welcome back."
            }
            sub={
              register
                ? "Create an account to book, manage your stays, and share your experiences."
                : admin
                  ? "Sign in with your hotel administrator account."
                  : "Sign in to reserve your room and manage your stays."
            }
          />
          <form className="card form-stack" onSubmit={submit}>
            {register && (
              <>
                <Field label="Full name">
                  <input required defaultValue="Alex Morgan" />
                </Field>
                <Field label="Phone number">
                  <input required defaultValue="+1 (555) 010-0142" />
                </Field>
              </>
            )}
            <Field label="Email address">
              <input
                required
                type="email"
                defaultValue={
                  admin ? "admin@aurel.example" : "alex.morgan@example.com"
                }
              />
            </Field>
            <Field label="Password">
              <input required type="password" defaultValue="AurelHouse26" />
            </Field>
            {register && (
              <Field label="Confirm password">
                <input required type="password" defaultValue="AurelHouse26" />
              </Field>
            )}
            <label className="check">
              <input type="checkbox" defaultChecked />{" "}
              {register
                ? "I agree to the Terms of Service and Privacy Policy."
                : "Remember me"}
            </label>
            <button className="primary" type="submit">
              {register
                ? "Create account"
                : admin
                  ? "Sign in to admin"
                  : "Sign in"}
            </button>
            {!admin && (
              <button
                type="button"
                className="link"
                onClick={() => c.go(register ? "login" : "register")}
              >
                {register
                  ? "Already have an account? Sign in"
                  : "New to Aurel House? Create an account"}
              </button>
            )}
          </form>
          {admin && (
            <Notice>
              Authorized staff only. Customer accounts cannot access this area.
            </Notice>
          )}
        </div>
      </main>
    </>
  )
}

function Booking(
  c: Common & {
    discount: string
    setDiscount: (s: string) => void
    applied: boolean
    setApplied: (v: boolean) => void
  },
) {
  const apply = () => {
    const ok = c.discount.trim().toUpperCase() === "WELCOME10"
    c.setApplied(ok)
    c.setToast(
      ok
        ? { text: "WELCOME10 applied. You saved $54.00." }
        : { text: "That discount code is not valid.", tone: "error" },
    )
  }
  return (
    <>
      <Header {...c} />
      <main>
        <Steps active={0} />
        <Title
          eyebrow="Your stay, your way"
          title="A few details, then you’re all set."
          sub="Signed in as Alex Morgan · alex.morgan@example.com"
        />
        <div className="checkout-layout">
          <div>
            <section className="card">
              <h2>Stay details</h2>
              <div className="field-grid">
                <StayDateFields
                  searchCriteria={c.searchCriteria}
                  setSearchCriteria={c.setSearchCriteria}
                />
                <Field label="Guests">
                  <select>
                    <option>2 adults</option>
                  </select>
                </Field>
                <Field label="Length of stay">
                  <input value="3 nights" readOnly />
                </Field>
              </div>
              <p className="valid">✓ Room 204 is available for all 3 nights.</p>
              <Field label="Special requests (optional)">
                <textarea defaultValue="A quiet room, please." />
              </Field>
            </section>
            <section className="card">
              <h2>A little something extra</h2>
              <div className="discount">
                <Field label="Discount code">
                  <input
                    value={c.discount}
                    onChange={(e) => c.setDiscount(e.target.value)}
                    placeholder="Try WELCOME10"
                  />
                </Field>
                <button className="outline" onClick={apply}>
                  Apply code
                </button>
              </div>
              {c.applied && (
                <div className="row">
                  <Badge>10% applied</Badge>
                  <button className="link" onClick={() => c.setApplied(false)}>
                    Remove code
                  </button>
                </div>
              )}
              <small>You can use the demo code WELCOME10.</small>
            </section>
            <Notice>Your room is reserved while you complete checkout.</Notice>
          </div>
          <Summary applied={c.applied} room={c.selectedRoom}>
            <label className="check">
              <input type="checkbox" defaultChecked /> I agree to the booking
              terms and cancellation policy.
            </label>
            <button className="primary" onClick={() => c.go("payment")}>
              Continue to payment →
            </button>
          </Summary>
        </div>
      </main>
      <SimpleFooter />
    </>
  )
}

function Summary({
  applied,
  room,
  children,
}: {
  applied: boolean
  room: Room
  children?: ReactNode
}) {
  const total = room.price * 3 - (applied ? 54 : 0)
  return (
    <aside>
      <section className="card summary">
        <img src={room.image} alt={room.name} />
        <h2>
          {room.name} · Room {room.number}
        </h2>
        <p>Nov 12–15, 2026 · 3 nights · 2 adults</p>
        <hr />
        <div className="row">
          <span>${room.price} × 3 nights</span>
          <b>${room.price * 3}.00</b>
        </div>
        {applied && (
          <div className="row">
            <span>WELCOME10 · 10% off</span>
            <b>−$54.00</b>
          </div>
        )}
        <div className="row">
          <span>Taxes & fees</span>
          <b>Included</b>
        </div>
        <hr />
        <div className="row total">
          <b>Total · USD</b>
          <strong>${total}.00</strong>
        </div>
        <small>No hidden fees. Your rate is secured for these dates.</small>
      </section>
      {children}
    </aside>
  )
}

function Payment(c: Common & { applied: boolean }) {
  const [card, setCard] = useState("4242 4242 4242 4242")
  const pay = () => {
    c.go("processing")
    setTimeout(() => c.go(card.includes("0000") ? "failure" : "success"), 1600)
  }
  return (
    <>
      <Header {...c} />
      <main>
        <Steps active={1} />
        <Title
          eyebrow="Secure your stay"
          title="One step closer to checking in."
          sub="Booking AH-261112-204 · Alex Morgan"
        />
        <Notice tone="success">
          Booking created · Email sent. Your reservation is Pending and payment
          is Unpaid.
        </Notice>
        <div className="checkout-layout">
          <section className="card form-stack">
            <div className="row">
              <h2>Payment method</h2>
              <Badge tone="pending">Unpaid</Badge>
            </div>
            <div className="payment-tabs">
              <button className="outline">● Credit / debit card</button>
              <button className="outline">○ Simulated wallet</button>
            </div>
            <Field label="Name on card">
              <input defaultValue="Alex Morgan" />
            </Field>
            <Field label="Card number">
              <input value={card} onChange={(e) => setCard(e.target.value)} />
              <small>
                Use 4242 for success or any number ending 0000 to test failure.
              </small>
            </Field>
            <div className="field-grid">
              <Field label="Expiration date">
                <input defaultValue="12 / 28" />
              </Field>
              <Field label="Security code">
                <input defaultValue="•••" />
              </Field>
            </div>
            <Field label="Billing postal code">
              <input defaultValue="10018" />
            </Field>
            <button className="primary" onClick={pay}>
              Confirm payment · ${c.applied ? "486" : "540"}.00
            </button>
            <small>
              ▣ Simulated online checkout. No real payment will be taken.
            </small>
          </section>
          <Summary applied={c.applied} room={c.selectedRoom} />
        </div>
      </main>
      <SimpleFooter />
    </>
  )
}

function Outcome({
  kind,
  ...c
}: Common & { kind: "processing" | "success" | "failure" }) {
  const success = kind === "success",
    fail = kind === "failure"
  return (
    <>
      <Header {...c} />
      <main>
        <Steps active={success ? 2 : 1} />
        <section className={`outcome card ${kind}`}>
          <div className="outcome-icon">{success ? "✓" : fail ? "!" : "◔"}</div>
          <h1>
            {success
              ? "Your room is ready for you."
              : fail
                ? "Your payment didn’t go through."
                : "Verifying your payment..."}
          </h1>
          <p>
            {success
              ? "Payment successful. We look forward to welcoming you to Aurel House."
              : fail
                ? "No payment was collected. Your reservation is still Pending, and you can retry."
                : "Please keep this page open while we confirm your payment. This usually takes a few moments."}
          </p>
          <div>
            <Badge tone={success ? "success" : "pending"}>
              {success ? "Confirmed" : "Pending"}
            </Badge>{" "}
            <Badge tone={fail ? "error" : success ? "success" : "pending"}>
              {fail ? "Failed" : success ? "Paid" : "Unpaid"}
            </Badge>
          </div>
          <hr />
          <h3>AH-261112-204</h3>
          <p>Alex Morgan · Deluxe King · Room 204</p>
          <p>Nov 12–15, 2026 · 3 nights · 2 adults</p>
          <div className="row total">
            <b>{success ? "Total paid" : "Total due"}</b>
            <strong>$486.00</strong>
          </div>
          {success && (
            <Notice tone="success">
              Booking confirmed · Email sent. Your receipt was sent to
              alex.morgan@example.com.
            </Notice>
          )}
          {fail && (
            <Notice tone="error">
              Card declined · DEMO-402. Check your card details or choose
              another payment method.
            </Notice>
          )}
          {success && (
            <button className="primary" onClick={() => c.go("bookings")}>
              View my booking →
            </button>
          )}
          {fail && (
            <button className="primary" onClick={() => c.go("payment")}>
              Retry payment · $486.00
            </button>
          )}
          {kind === "processing" && (
            <Notice>
              Your reservation is safe while payment verification is in
              progress.
            </Notice>
          )}
        </section>
      </main>
      <SimpleFooter />
    </>
  )
}

const bookingRows = [
  {
    id: "AH-261112-204",
    room: "Deluxe King · 204",
    date: "Nov 12–15, 2026",
    total: "$486.00 USD",
    status: "Confirmed",
    payment: "Paid",
    action: "Cancel booking",
  },
  {
    id: "AH-261120-206",
    room: "Deluxe King · 206",
    date: "Nov 20–23, 2026",
    total: "$540.00 USD",
    status: "Pending",
    payment: "Failed",
    action: "Retry payment",
  },
  {
    id: "AH-261205-208",
    room: "Garden Twin · 208",
    date: "Dec 5–7, 2026",
    total: "$300.00 USD",
    status: "Pending",
    payment: "Unpaid",
    action: "Complete payment",
  },
  {
    id: "AH-261002-204",
    room: "Deluxe King · 204",
    date: "Oct 2–5, 2026",
    total: "$540.00 USD",
    status: "Completed",
    payment: "Paid",
    action: "Write a review",
  },
  {
    id: "AH-260918-301",
    room: "Corner Suite · 301",
    date: "Sep 18–20, 2026",
    total: "$520.00 USD",
    status: "Cancelled",
    payment: "Refunded",
    action: "Refund details",
  },
]

function Bookings(c: Common) {
  const [tab, setTab] = useState("All stays")
  const rows = bookingRows.filter(
    (x, i) => tab === "All stays" || (tab === "Upcoming" ? i < 3 : i >= 3),
  )
  return (
    <>
      <Header {...c} />
      <main>
        <Title
          eyebrow="Your Aurel account"
          title="Your stays, all in one place."
          sub="Only your reservations are shown here. Signed in as Alex Morgan."
        />
        <div className="tabs">
          {["All stays", "Upcoming", "Past stays"].map((x) => (
            <button
              className={tab === x ? "primary" : "outline"}
              onClick={() => setTab(x)}
              key={x}
            >
              {x} ({x === "All stays" ? 5 : x === "Upcoming" ? 3 : 2})
            </button>
          ))}
        </div>
        <div className="booking-list">
          {rows.map((b, i) => (
            <article className="card booking-row" key={b.id}>
              {i === 0 && <img src={`${A}/75c58.png`} alt="Deluxe King" />}
              <div>
                <small>{b.id}</small>
                <h2>{b.room}</h2>
                <p>{b.date}</p>
                <small>3 nights · 2 adults · Alex Morgan</small>
              </div>
              <div>
                <Badge
                  tone={
                    b.status === "Cancelled"
                      ? "error"
                      : b.status === "Pending"
                        ? "pending"
                        : "success"
                  }
                >
                  {b.status}
                </Badge>{" "}
                <Badge
                  tone={
                    b.payment === "Failed"
                      ? "error"
                      : b.payment === "Unpaid"
                        ? "pending"
                        : "success"
                  }
                >
                  {b.payment}
                </Badge>
                <h2>{b.total}</h2>
                {i === 0 && <small>WELCOME10 applied · Saved $54</small>}
              </div>
              <div>
                <button
                  className="outline"
                  onClick={() => c.go("booking-detail")}
                >
                  View details
                </button>
                <button
                  className={
                    b.action.includes("Cancel") ? "link danger" : "link"
                  }
                  onClick={() =>
                    b.action.includes("review")
                      ? c.go("review")
                      : b.action.includes("payment") ||
                          b.action.includes("Retry")
                        ? c.go("payment")
                        : c.setToast({ text: `${b.action} selected.` })
                  }
                >
                  {b.action}
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>
      <SimpleFooter />
    </>
  )
}

function BookingDetail(c: Common) {
  return (
    <>
      <Header {...c} />
      <main>
        <button className="link" onClick={() => c.go("bookings")}>
          ← My bookings
        </button>
        <Title
          eyebrow="Reservation AH-261112-204"
          title="We’ll see you soon, Alex."
          sub="Created Oct 30, 2026 · Your reservation and payment details."
        />
        <p>
          <Badge>Confirmed</Badge> <Badge>Paid</Badge>
        </p>
        <div className="checkout-layout">
          <div>
            <img
              className="wide-image"
              src={`${A}/75c58.png`}
              alt="Deluxe King"
            />
            <section className="card">
              <h2>Deluxe King · Room 204</h2>
              {[
                ["Check-in", "Nov 12, 2026 · 3 PM"],
                ["Check-out", "Nov 15, 2026 · 11 AM"],
                ["Stay", "3 nights · 2 adults"],
                ["Primary guest", "Alex Morgan · Customer C-1042"],
              ].map((x) => (
                <div className="row detail-row" key={x[0]}>
                  <span>{x[0]}</span>
                  <b>{x[1]}</b>
                </div>
              ))}
            </section>
            <section className="card">
              <h2>Payment verified</h2>
              <p>
                Reference <b>PAY-204-1112</b>
              </p>
              <p>Demo Visa •••• 4242 · $486.00 USD</p>
            </section>
          </div>
          <Summary applied room={c.selectedRoom}>
            <button
              className="outline"
              onClick={() => c.setToast({ text: "Receipt downloaded." })}
            >
              Download receipt
            </button>
            <button
              className="outline danger"
              onClick={() =>
                c.setModal(
                  <Confirm
                    title="Cancel this booking?"
                    text="Your refund will be returned to the original payment method."
                    onConfirm={() => {
                      c.setModal(null)
                      c.setToast({
                        text: "Booking cancelled and refund email sent.",
                      })
                    }}
                  />,
                )
              }
            >
              Cancel booking
            </button>
          </Summary>
        </div>
      </main>
      <SimpleFooter />
    </>
  )
}

function Profile(c: Common) {
  return (
    <>
      <Header {...c} />
      <main>
        <Title
          eyebrow="Your Aurel account"
          title="A place for your details."
          sub="Keep your information up to date for a smooth check-in."
        />
        <div className="profile-layout">
          <aside className="card profile-card">
            <div className="avatar">AM</div>
            <h2>Alex Morgan</h2>
            <p>Customer C-1042 · Joined Sep 2026</p>
            <Badge>Active</Badge>
            <button className="link">Profile & security</button>
            <button className="link" onClick={() => c.go("bookings")}>
              My bookings
            </button>
            <button
              className="link danger"
              onClick={() => {
                c.setLoggedIn(false)
                c.go("home")
              }}
            >
              Log out
            </button>
          </aside>
          <div>
            <section className="card">
              <h2>Personal information</h2>
              <div className="field-grid">
                <Field label="Full name">
                  <input defaultValue="Alex Morgan" />
                </Field>
                <Field label="Email address">
                  <input defaultValue="alex.morgan@example.com" />
                </Field>
                <Field label="Phone number">
                  <input defaultValue="+1 (555) 010-0142" />
                </Field>
              </div>
              <button
                className="primary"
                onClick={() => c.setToast({ text: "Profile changes saved." })}
              >
                Save changes
              </button>
            </section>
            <section className="card">
              <h2>Password & security</h2>
              <div className="field-grid">
                <Field label="Current password">
                  <input type="password" defaultValue="AurelHouse26" />
                </Field>
                <Field label="New password">
                  <input type="password" placeholder="Enter a new password" />
                </Field>
              </div>
              <button
                className="outline"
                onClick={() => c.setToast({ text: "Password updated." })}
              >
                Update password
              </button>
            </section>
          </div>
        </div>
      </main>
      <SimpleFooter />
    </>
  )
}

function Review(c: Common) {
  const [rating, setRating] = useState(5),
    [sent, setSent] = useState(false)
  return (
    <>
      <Header {...c} />
      <main>
        <button className="link" onClick={() => c.go("bookings")}>
          ← My bookings
        </button>
        <Title
          eyebrow="Your experience matters"
          title="How was your stay?"
          sub="Share the little things that made your time at Aurel House memorable."
        />
        <div className="review-layout">
          <aside>
            <img
              className="wide-image"
              src={`${A}/75c58.png`}
              alt="Deluxe King"
            />
            <section className="card">
              <Badge>Completed</Badge>
              <h2>Deluxe King · 204</h2>
              <p>Oct 2–5, 2026 · 3 nights · 2 adults</p>
              <p>$540.00 · Paid</p>
            </section>
          </aside>
          <section className="card">
            <h2>Your review</h2>
            <b>Overall rating · {rating} out of 5</b>
            <div className="rating">
              {[1, 2, 3, 4, 5].map((x) => (
                <button onClick={() => setRating(x)} key={x}>
                  {x <= rating ? "★" : "☆"}
                </button>
              ))}
            </div>
            <Field label="Tell us about your stay">
              <textarea defaultValue="A lovely, peaceful stay. The room was spotless, the bed was incredibly comfortable, and breakfast in the courtyard was a highlight." />
            </Field>
            <Notice tone="success">
              Verified completed stay. You can review this room because the
              reservation is marked Completed.
            </Notice>
            <button
              className="primary"
              disabled={sent}
              onClick={() => {
                setSent(true)
                c.setToast({ text: "Thank you. Your review is now published." })
              }}
            >
              {sent ? "Review submitted" : "Submit review"}
            </button>
          </section>
        </div>
      </main>
      <SimpleFooter />
    </>
  )
}

function InfoPage({ page, ...c }: Common & { page: "about" | "contact" }) {
  if (page === "about")
    return (
      <>
        <Header {...c} />
        <main>
          <Title
            eyebrow="Our house, your place"
            title="A quieter kind of extraordinary."
            sub="Good design. Genuine warmth. Room to feel at home."
          />
          <img
            className="about-hero"
            src={`${A}/490ac.png`}
            alt="Aurel House lobby"
          />
          <div className="split prose">
            <div>
              <h2>Rooted in thoughtful hospitality.</h2>
              <p>
                Aurel House is a fictional, independently minded boutique hotel
                in Brookfield. Our university-project concept brings together
                contemporary comfort and the warmth of a personal welcome.
              </p>
            </div>
            <div>
              <p>
                From a carefully prepared breakfast to a room that feels
                instantly restful, we believe the smallest details make the
                biggest difference.
              </p>
              <button className="primary" onClick={() => c.go("rooms")}>
                Find your room →
              </button>
            </div>
          </div>
          <div className="stats">
            {[
              ["48", "Thoughtfully designed rooms"],
              ["24/7", "A personal welcome"],
              ["01", "Quiet courtyard retreat"],
            ].map((x) => (
              <div className="card" key={x[0]}>
                <strong>{x[0]}</strong>
                <p>{x[1]}</p>
              </div>
            ))}
          </div>
        </main>
        <SimpleFooter />
      </>
    )
  const send = (e: FormEvent) => {
    e.preventDefault()
    c.setToast({ text: "Message sent. A confirmation email is on its way." })
  }
  return (
    <>
      <Header {...c} />
      <main>
        <Title
          eyebrow="We’re here for you"
          title="Let’s make your stay special."
          sub="Questions, special requests, or a little local advice? Get in touch."
        />
        <div className="contact-layout">
          <div>
            <img
              className="wide-image"
              src={`${A}/6b457.png`}
              alt="Aurel House"
            />
            <section className="card">
              <h2>Find us at Aurel House</h2>
              <p>18 Garden Avenue, Brookfield, BF 10018</p>
              <p>
                Call us <b>+1 (555) 010-2040</b>
              </p>
              <p>
                Email <b>stay@aurel.example</b>
              </p>
              <p>Front desk open 24 hours · Check-in 3 PM · Check-out 11 AM</p>
            </section>
          </div>
          <form className="card form-stack" onSubmit={send}>
            <h2>Send us a message</h2>
            <Field label="Full name">
              <input required defaultValue="Alex Morgan" />
            </Field>
            <Field label="Email address">
              <input
                required
                type="email"
                defaultValue="alex.morgan@example.com"
              />
            </Field>
            <Field label="Subject">
              <select>
                <option>Special request for my stay</option>
                <option>General question</option>
              </select>
            </Field>
            <Field label="Your message">
              <textarea
                required
                defaultValue="We’re celebrating our anniversary. Could you arrange a quiet room overlooking the garden?"
              />
            </Field>
            <button className="primary">Send message</button>
          </form>
        </div>
      </main>
      <SimpleFooter />
    </>
  )
}

const adminNav: [Page, string, string][] = [
  ["admin", "Dashboard", "▦"],
  ["admin-rooms", "Manage Rooms", "▱"],
  ["admin-types", "Manage Room Types", "◇"],
  ["admin-bookings", "Manage Bookings", "▣"],
  ["admin-customers", "Manage Customers", "♧"],
  ["reports", "Reports", "▥"],
]
function Admin({ page, ...c }: Common & { page: Page }) {
  const [query, setQuery] = useState("")
  const title = adminNav.find((x) => x[0] === page)?.[1] || "Dashboard"
  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <Brand light />
        <Eyebrow>Hotel management</Eyebrow>
        {adminNav.map(([p, label, icon]) => (
          <button
            className={page === p ? "active" : ""}
            onClick={() => c.go(p)}
            key={p}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
        <button onClick={() => c.go("admin-login")}>↪ Logout</button>
        <div className="admin-user">
          <b>Jordan Lee</b>
          <small>Administrator · Admin-only access</small>
        </div>
      </aside>
      <div className="admin-main">
        <div className="admin-top">
          Hotel management / {title}
          <b>Jordan Lee · Admin</b>
        </div>
        <main>
          <Title
            eyebrow="Aurel House · Brookfield"
            title={
              title === "Dashboard" ? "A clear view of your hotel." : title
            }
            sub={
              title === "Dashboard"
                ? "Friday, October 30, 2026 · Live hotel snapshot"
                : title === "Reports"
                  ? "Oct 1–30, 2026 · Reservation creation dates · All amounts in USD"
                  : "Manage hotel operations with a single source of truth."
            }
          />
          {page === "admin" ? (
            <Dashboard />
          ) : page === "reports" ? (
            <Reports />
          ) : (
            <AdminTable page={page} query={query} setQuery={setQuery} {...c} />
          )}
        </main>
      </div>
    </div>
  )
}

function Dashboard() {
  return (
    <>
      <div className="metric-grid">
        {[
          ["Total Rooms", "48", "32 occupied · 67% occupancy"],
          ["Customers", "124", "120 active · 4 inactive"],
          ["Reservations", "192", "Created Oct 1–30, 2026"],
          ["Pending", "18", "12 Unpaid · 6 Failed payments"],
          ["Confirmed", "44", "Verified Paid reservations"],
          ["Currently Occupied", "32", "Subset of confirmed reservations"],
        ].map((x) => (
          <div className="card metric" key={x[0]}>
            <span>{x[0]}</span>
            <strong>{x[1]}</strong>
            <small>{x[2]}</small>
          </div>
        ))}
      </div>
      <div className="chart-grid">
        <BarChart title="Reservations by week" values={[36, 42, 54, 60]} />
        <section className="card">
          <h2>Reservation status</h2>
          {[
            ["Pending", "18 · 9.4%"],
            ["Confirmed", "44 · 22.9%"],
            ["Completed", "118 · 61.5%"],
            ["Cancelled", "12 · 6.2%"],
          ].map((x) => (
            <div className="row status-line" key={x[0]}>
              <Badge>{x[0]}</Badge>
              <b>{x[1]}</b>
            </div>
          ))}
        </section>
      </div>
      <h2>Recent activity</h2>
      <section className="card activity">
        {[
          "10:42 AM  Payment verified — Alex Morgan · $486 · Confirmed",
          "10:38 AM  Reservation created — Alex Morgan · Deluxe King 204",
          "09:15 AM  Guest checked in — Priya Shah · Corner Suite 302",
        ].map((x) => (
          <p key={x}>{x}</p>
        ))}
      </section>
    </>
  )
}

function AdminTable({
  page,
  query,
  setQuery,
  setModal,
  setToast,
}: Common & { page: Page query: string setQuery: (s: string) => void }) {
  const configs: Record<string, { heads: string[] rows: string[][] }> = {
    "admin-rooms": {
      heads: [
        "Room number",
        "Room type",
        "Nightly price",
        "Capacity",
        "Operational status",
        "Actions",
      ],
      rows: [
        ["204", "Deluxe King", "$180", "2", "Available", "Edit · Remove"],
        ["206", "Deluxe King", "$180", "2", "Occupied", "Edit · Remove"],
        ["208", "Garden Twin", "$150", "2", "Available", "Edit · Remove"],
        ["210", "Garden Twin", "$150", "2", "Out of service", "Edit · Remove"],
        ["301", "Corner Suite", "$260", "3", "Available", "Edit · Remove"],
      ],
    },
    "admin-types": {
      heads: [
        "Type name",
        "Description",
        "Capacity",
        "Base price",
        "Rooms",
        "Actions",
      ],
      rows: [
        [
          "Deluxe King",
          "King bed, garden view, 32 m²",
          "2",
          "$180",
          "24",
          "Edit · Delete",
        ],
        [
          "Garden Twin",
          "Twin beds, courtyard view, 30 m²",
          "2",
          "$150",
          "16",
          "Edit · Delete",
        ],
        [
          "Corner Suite",
          "King bed, lounge, city view, 52 m²",
          "3",
          "$260",
          "8",
          "Edit · Delete",
        ],
      ],
    },
    "admin-bookings": {
      heads: [
        "Booking ID",
        "Customer",
        "Room",
        "Check-in",
        "Total USD",
        "Booking",
        "Payment",
        "Actions",
      ],
      rows: bookingRows.map((x, i) => [
        x.id,
        "Alex Morgan",
        i === 4 ? "301" : "204",
        x.date.split("–")[0],
        x.total.split(" ")[0],
        x.status,
        x.payment,
        "Details · Cancel",
      ]),
    },
    "admin-customers": {
      heads: [
        "Customer ID",
        "Full name",
        "Email address",
        "Phone number",
        "Account status",
        "Actions",
      ],
      rows: [
        [
          "C-1042",
          "Alex Morgan",
          "alex.morgan@example.com",
          "+1 (555) 010-0142",
          "Active",
          "Details · Deactivate",
        ],
        [
          "C-1043",
          "Priya Shah",
          "priya.shah@example.com",
          "+1 (555) 010-0143",
          "Active",
          "Details · Deactivate",
        ],
        [
          "C-1044",
          "Noah Williams",
          "noah.w@example.com",
          "+1 (555) 010-0144",
          "Inactive",
          "Details · Activate",
        ],
        [
          "C-1045",
          "Emma Chen",
          "emma.chen@example.com",
          "+1 (555) 010-0145",
          "Active",
          "Details · Deactivate",
        ],
      ],
    },
  }
  const config = configs[page]
  const rows = config.rows.filter((x) =>
    x.join(" ").toLowerCase().includes(query.toLowerCase()),
  )
  const add = () =>
    setModal(
      <AdminForm
        title={page === "admin-types" ? "Create room type" : "Add room"}
        onSave={() => {
          setModal(null)
          setToast({ text: "Management record saved." })
        }}
      />,
    )
  return (
    <>
      <div className="admin-actions">
        <Field label={`Search ${page.replace("admin-", "")}`}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter name, ID, or room"
          />
        </Field>
        {(page === "admin-rooms" || page === "admin-types") && (
          <button className="primary" onClick={add}>
            + {page === "admin-types" ? "Create room type" : "Add room"}
          </button>
        )}
      </div>
      <div className="table-wrap card">
        <table>
          <thead>
            <tr>
              {config.heads.map((x) => (
                <th key={x}>{x}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {r.map((v, j) => (
                  <td key={j}>
                    {j === r.length - 2 &&
                    ["Available", "Active", "Confirmed", "Paid"].includes(v) ? (
                      <Badge>{v}</Badge>
                    ) : j === r.length - 1 ? (
                      <button
                        className="link"
                        onClick={() =>
                          setToast({ text: `${v} action opened.` })
                        }
                      >
                        {v}
                      </button>
                    ) : (
                      v
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          Showing {rows.length} records · Page 1 of 1{" "}
          <span>‹ Previous　 Next ›</span>
        </div>
      </div>
      <Notice>
        Changes in this prototype use realistic mock data and remain in the
        current preview session.
      </Notice>
    </>
  )
}

function Reports() {
  return (
    <>
      <div className="metric-grid">
        {[
          ["Reservations", "192"],
          ["Verified payments", "$78,360"],
          ["Refunds", "$3,840"],
          ["Net revenue", "$74,520"],
          ["Average net / paid stay", "$460"],
          ["Current occupancy", "67%"],
        ].map((x) => (
          <div className="card metric" key={x[0]}>
            <span>{x[0]}</span>
            <strong>{x[1]}</strong>
            <small>Oct 1–30 · reporting period</small>
          </div>
        ))}
      </div>
      <div className="chart-grid">
        <BarChart
          title="Net revenue by week"
          values={[13200, 16800, 21120, 23400]}
          money
        />
        <section className="card">
          <h2>Reservation status</h2>
          {[
            "Pending 18 · 9.4%",
            "Confirmed 44 · 22.9%",
            "Completed 118 · 61.5%",
            "Cancelled 12 · 6.2%",
          ].map((x) => (
            <p key={x}>{x}</p>
          ))}
        </section>
      </div>
      <BarChart title="Reservation volume by week" values={[36, 42, 54, 60]} />
      <Notice>
        Report reconciliation: 192 reservations · 162 verified payments · 8
        refunded cancellations.
      </Notice>
    </>
  )
}

function BarChart({
  title,
  values,
  money,
}: {
  title: string
  values: number[]
  money?: boolean
}) {
  const max = Math.max(...values)
  return (
    <section className="card chart">
      <h2>{title}</h2>
      <p>October 2026 · live prototype data</p>
      <div className="bars">
        {values.map((v, i) => (
          <div key={i}>
            <span>{money ? `$${v.toLocaleString()}` : v}</span>
            <i style={{ height: `${45 + (v / max) * 80}px` }}></i>
            <small>
              Oct {i ? i * 7 + 1 : 1}–{i === 3 ? 30 : i * 7 + 7}
            </small>
          </div>
        ))}
      </div>
    </section>
  )
}

function AdminForm({ title, onSave }: { title: string onSave: () => void }) {
  return (
    <>
      <h2>{title}</h2>
      <p>Enter details for this hotel management record.</p>
      <div className="form-stack">
        <Field label="Name / room number">
          <input autoFocus placeholder="Room 304" />
        </Field>
        <Field label="Room type">
          <select>
            <option>Deluxe King</option>
            <option>Garden Twin</option>
          </select>
        </Field>
        <Field label="Nightly price">
          <input type="number" defaultValue="180" />
        </Field>
        <div className="modal-actions">
          <button className="outline" onClick={() => history.back()}>
            Cancel
          </button>
          <button className="primary" onClick={onSave}>
            Save record
          </button>
        </div>
      </div>
    </>
  )
}

function Confirm({
  title,
  text,
  onConfirm,
}: {
  title: string
  text: string
  onConfirm: () => void
}) {
  return (
    <>
      <h2>{title}</h2>
      <p>{text}</p>
      <div className="modal-actions">
        <button className="outline" onClick={() => location.reload()}>
          Keep booking
        </button>
        <button className="danger-button" onClick={onConfirm}>
          Confirm cancellation
        </button>
      </div>
    </>
  )
}

function Field({ label, children }: { label: string children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  )
}
function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="eyebrow">{children}</span>
}
function Title({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string
  title: string
  sub?: string
}) {
  return (
    <div className="title">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1>{title}</h1>
      {sub && <p>{sub}</p>}
    </div>
  )
}
function Badge({
  children,
  tone = "success",
}: {
  children: ReactNode
  tone?: string
}) {
  return <span className={`badge ${tone}`}>{children}</span>
}
function ReviewQuote({ text }: { text: string }) {
  return (
    <blockquote className="card">
      <p className="stars">★★★★★</p>
      <p>“{text}”</p>
      <small>Jamie R. · October 2026 · Illustrative review</small>
    </blockquote>
  )
}
function Notice({
  children,
  tone = "info",
}: {
  children: ReactNode
  tone?: string
}) {
  return (
    <div className={`notice ${tone}`}>
      ⓘ <span>{children}</span>
    </div>
  )
}
function Steps({ active }: { active: number }) {
  return (
    <div className="steps">
      {["Your stay", "Payment", "Confirmation"].map((x, i) => (
        <span className={i === active ? "active" : ""} key={x}>
          ●　{x}
        </span>
      ))}
    </div>
  )
}
function SimpleFooter() {
  return (
    <div className="simple-footer">
      Aurel House · Terms · Privacy · Contact
      <br />
      Fictional university project · USD · © 2026
    </div>
  )
}
