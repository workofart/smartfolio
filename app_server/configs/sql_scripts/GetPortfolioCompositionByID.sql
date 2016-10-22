-- FUNCTION: public.GetPortfolioCompositionByID(integer, integer)
-- In command line, to install function run: "psql -d <dbname> -a -f <filename>"
DROP FUNCTION IF EXISTS public.GetPortfolioCompositionByID(integer, integer);

CREATE OR REPLACE FUNCTION public.GetPortfolioCompositionByID
(
	s_userid INTEGER,
    s_portfolioid INTEGER
)
RETURNS TABLE (
    ticker VARCHAR,
    portion NUMERIC
)
AS
$$
BEGIN
	RETURN QUERY
    SELECT
        T.ticker,
        SUM(T.quantity * T.price)
    FROM users AS U
    INNER JOIN portfolios AS P ON U.userid = P.userid
    INNER JOIN transactions as T ON P.portfolioid = T.portfolioid
    WHERE U.userid = s_userid AND P.portfolioid = s_portfolioid
    GROUP BY T.ticker;
END;
$$

LANGUAGE 'plpgsql'