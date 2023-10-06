import {
  Form,
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import css from './app.css'
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import type { ContactRecord } from "./data";
import { createEmptyContact, getContacts } from "./data";
import { useEffect, useRef } from "react";


export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: css }];

}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const q = url.searchParams.get('q') ?? ''
  const contacts = await getContacts(q)
  return json({ contacts, q })
}

export const action = async () => {
  const contact = await createEmptyContact()
  return redirect(`/contacts/${contact.id}/edit`)
}


export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  const submit = useSubmit()
  const searchInput = useRef<HTMLInputElement>(null)
  const searching = navigation.location && new URLSearchParams(navigation.location.search).has('q')
  useEffect(() => {
    if (searchInput?.current) {
      searchInput.current.value = q
    }
  }, [q])
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <h1>Remix Contacts</h1>
          <div>
            <Form id="search-form"
              onChange={(event) => {
                const isFirstSearch = q === null
                submit(event.currentTarget, { replace: !isFirstSearch })
              }}
              role="search">
              <input
                ref={searchInput}
                className={searching ? 'loading' : ''}
                id="q"
                defaultValue={q}
                aria-label="Search contacts"
                placeholder="Search"
                type="search"
                name="q"
              />
              <div id="search-spinner" aria-hidden hidden={true} />
            </Form>
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>
          <nav>
            {contacts.length ? (
              <ul>
                {contacts.map(contact => (<Contact key={contact.id} contact={contact} />))}
              </ul>) : null
            }
          </nav>
        </div>
        <div id="detail" className={navigation.state === "loading" && !searching ? "loading" : ""}>
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}


type ContactProps = {
  contact: ContactRecord;
}
function Contact({ contact }: ContactProps) {

  return (
    <li>
      <NavLink
        className={({ isActive, isPending }) => isActive ? 'active' : isPending ? 'pending' : ''}
        to={`/contacts/${contact.id}`}>
        {contact.first || contact.last ?
          <>{contact.first} {contact.last}</> :
          <i>No Name</i>
        }
      </NavLink>
    </li>
  )
}
