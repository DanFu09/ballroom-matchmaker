# ballroom-matchmaker

This is a tool for automatically matching up a large number of partners given a
few bits of information.  It's intended to help team captains pair up rookie
dancers at the beginning of the semester.

The tool tries to create partnerships that will last long by trying to pair up
people who have a good height match and similar levels of dedication, but it
will prioritize making sure that everyone has a partner first.  This means that
sometimes it will make leaders follow or vice versa.

Most of the implementation is in js/matcher.js.  Some details about usage are
in the docs folder.  Some example tsv's are in the examples folder.