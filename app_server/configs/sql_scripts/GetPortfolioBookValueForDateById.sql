-- FUNCTION: public.GetPortfolioBookValueForDateById(integer)
-- In command line, to install function run: "psql -d <dbname> -a -f <filename>"
DROP FUNCTION IF EXISTS public.GetPortfolioBookValueForDateById(integer, date);

CREATE OR REPLACE FUNCTION public.GetPortfolioBookValueForDateById
(
    s_portfolioid INTEGER,
    s_date DATE
)
RETURNS TABLE (
    ticker VARCHAR(8),
    value NUMERIC
)
AS
$$
BEGIN
	RETURN QUERY
    SELECT
        T.ticker,
        SUM(T.quantity * T.price)
    FROM portfolios AS P
    INNER JOIN transactions as T ON P.portfolioid = T.portfolioid
    WHERE P.portfolioid = s_portfolioid
      AND T.status = 1
      AND date(T.datetime) <= s_date
    GROUP BY T.ticker; 
END;
$$

LANGUAGE 'plpgsql'