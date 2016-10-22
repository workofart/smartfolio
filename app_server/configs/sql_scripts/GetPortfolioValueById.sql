-- FUNCTION: public.GetPortfolioValueById(integer)
-- In command line, to install function run: "psql -d <dbname> -a -f <filename>"
DROP FUNCTION IF EXISTS public.GetPortfolioValueById(integer);

CREATE OR REPLACE FUNCTION public.GetPortfolioValueById
(
    s_portfolioid INTEGER
)
RETURNS TABLE (
    value MONEY
)
AS
$$
BEGIN
	RETURN QUERY
    SELECT
        SUM(T.quantity * T.price)
    FROM portfolios AS P
    INNER JOIN transactions as T ON P.portfolioid = T.portfolioid
    WHERE P.portfolioid = s_portfolioid
      AND T.status = 1;
END;
$$

LANGUAGE 'plpgsql'