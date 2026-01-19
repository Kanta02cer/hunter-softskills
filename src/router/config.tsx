import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import EventDetail from "../pages/event-detail/page";
import PastEventDetail from "../pages/past-event-detail/page";
import NewsDetail from "../pages/news-detail/page";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/event-detail",
    element: <EventDetail />,
  },
  {
    path: "/past-event-detail",
    element: <PastEventDetail />,
  },
  {
    path: "/news-detail",
    element: <NewsDetail />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
