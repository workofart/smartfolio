-- FUNCTION: public.GetPortfolioBookValueById(integer)
-- In command line, to install function run: "psql -d <dbname> -a -f <filename>"
DROP FUNCTION IF EXISTS public.GetPortfolioBookValueById(integer);

CREATE OR REPLACE FUNCTION public.GetPortfolioBookValueById
(
    s_portfolioid INTEGER
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
    GROUP BY T.ticker;
END;
$$

LANGUAGE 'plpgsql'