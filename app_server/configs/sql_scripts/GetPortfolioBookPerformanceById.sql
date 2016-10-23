-- FUNCTION: public.GetPortfolioBookPerformanceById(integer)
-- In command line, to install function run: "psql -d <dbname> -a -f <filename>"
DROP FUNCTION IF EXISTS public.GetPortfolioBookPerformanceById(integer);

CREATE OR REPLACE FUNCTION public.GetPortfolioBookPerformanceById
(
    s_portfolioid INTEGER
)
RETURNS TABLE (
    date Date,
    value NUMERIC
)
AS
$$
BEGIN
	RETURN QUERY
    SELECT
        date(T.datetime),
        SUM(T.quantity * T.price)
    FROM portfolios AS P
    INNER JOIN transactions as T ON P.portfolioid = T.portfolioid
    WHERE P.portfolioid = s_portfolioid
      AND T.status = 1
    GROUP BY date(T.datetime)
    ORDER BY date(T.datetime);
END;
$$

LANGUAGE 'plpgsql'